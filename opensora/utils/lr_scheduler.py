from torch.optim.lr_scheduler import _LRScheduler
import math
import torch

class LinearWarmupLR(_LRScheduler):
    """Linearly warmup learning rate and then linearly decay.

    Args:
        optimizer (:class:`torch.optim.Optimizer`): Wrapped optimizer.
        warmup_steps (int, optional): Number of warmup steps, defaults to 0
        last_step (int, optional): The index of last step, defaults to -1. When last_step=-1,
            the schedule is started from the beginning or When last_step=-1, sets initial lr as lr.
    """

    def __init__(self, optimizer, warmup_steps: int = 0, last_epoch: int = -1):
        self.warmup_steps = warmup_steps
        super().__init__(optimizer, last_epoch=last_epoch)

    def get_lr(self):
        if self.last_epoch < self.warmup_steps:
            return [(self.last_epoch + 1) / (self.warmup_steps + 1) * lr for lr in self.base_lrs]
        else:
            return self.base_lrs

class OneCycleScheduler(_LRScheduler):
    """Implements the 1-cycle learning rate policy with warmup and cooldown.

    Args:
        optimizer (Optimizer): Wrapped optimizer.
        max_lr (float or list): Upper learning rate boundaries in the cycle for each parameter group.
        warmup_steps (int): Number of steps to warm up the learning rate.
        cooldown_steps (int): Number of steps to cool down the learning rate.
        final_lr (float): The final learning rate at the end of the cooldown.
        min_lr (float): The minimum learning rate to start with.
        anneal_strategy (str): {'cos', 'linear'} Learning rate annealing strategy.
        last_epoch (int): The index of last epoch. Default: -1.
    """

    def __init__(self, optimizer, max_lr, warmup_steps, cooldown_steps, final_lr=0.001, min_lr=1e-7, anneal_strategy='cos', last_epoch=-1):
        self.max_lr = max_lr
        self.warmup_steps = warmup_steps
        self.cooldown_steps = cooldown_steps
        self.final_lr = final_lr
        self.min_lr = min_lr
        self.anneal_strategy = anneal_strategy

        self.step_size_up = self.warmup_steps
        self.step_size_down = self.cooldown_steps

        self.anneal_func = self._cosine_annealing if self.anneal_strategy == 'cos' else self._linear_annealing

        super(OneCycleScheduler, self).__init__(optimizer, last_epoch)

    def _cosine_annealing(self, step, start_lr, end_lr, step_size):
        cos_out = torch.cos(torch.tensor(math.pi * step / step_size)) + 1
        return end_lr + (start_lr - end_lr) / 2.0 * cos_out

    def _linear_annealing(self, step, start_lr, end_lr, step_size):
        return end_lr + (start_lr - end_lr) * (step / step_size)

    def get_lr(self):
        if self.last_epoch < self.step_size_up:
            # Warm-up phase
            lr = [self.anneal_func(self.last_epoch, self.min_lr, self.max_lr, self.step_size_up) for _ in self.base_lrs]
        elif self.last_epoch < self.step_size_up + self.step_size_down:
            # Cooldown phase
            step = self.last_epoch - self.step_size_up
            lr = [self.anneal_func(step, self.max_lr, self.final_lr, self.step_size_down) for _ in self.base_lrs]
        else:
            # Constant phase
            lr = [self.final_lr for _ in self.base_lrs]
        return lr

    def step(self, epoch=None):
        if self.last_epoch == -1:
            if epoch is None:
                self.last_epoch = 0
            else:
                self.last_epoch = epoch
        else:
            self.last_epoch = epoch if epoch is not None else self.last_epoch + 1
        for param_group, lr in zip(self.optimizer.param_groups, self.get_lr()):
            param_group['lr'] = lr