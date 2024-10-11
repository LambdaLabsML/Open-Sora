---
layout: post
icon: fas fa-lightbulb
title: Introduction
date: 2024-10-16
toc: true
order: 1
---

# Let's reproduce a **T2V** model!
In this tutorial, we will walk through the process of replicating [**Open-Sora 1.2**](https://github.com/hpcaitech/Open-Sora) in **28,000 H100 GPU Hours**.  

Open-Sora 1.2 is a **1.1B parameter Text-to-Video (T2V) model** that utilizes a transformer-based diffusion architecture. Unlike Text-to-Image (T2I) models, Text-to-Video models necessitate a distinct scaling approach. This guide will cover the steps for downloading and preparing the dataset, training the model from scratch, tackling the specific challenges encountered when training at scale, and offering advice for troubleshooting distributed training jobs.



## Why This Tutorial?
Recent T2I training methods can [complete training in about 2.6 days on a single 8xH100 GPU machine](https://arxiv.org/abs/2407.15811), which amounts to around 500 GPU hours. On the other hand, *T2V models* are still in their early stages, and we are yet to discover the most effective approaches. The open-source project we are replicating is a relatively small model with limited capabilities, but it needs at roughly six days of training on 192 H100 GPUs — that's about **28,000 GPU hours** — between two and three orders of magnitude longer compared to a fast T2I training scheme!

This also implies that after a full day of training on a single 8xH100 GPU machine, we won't observe significant progress, as one day of training accounts for less than one percent of the total training time. In this scenario, **trusting the process** is essential. The goal of this tutorial is to guarantee that resources are utilized effectively by identifying and eliminating points of failure as early as possible, to emphasize the differences that arise on such a large scale, the potential problems they pose, and — most importantly — how to tackle and solve them.



## Who Is This Tutorial For?
Unfortunately, this isn't a casual walkthrough that you can follow on your MacBook, but a comprehensive exploration of the challenges in scaling up Text-to-Video (T2V) machine learning models when standard waiting times become insufficient. If you're seeking a document to jumpstart your training process and wish to understand the distinctions and potential issues in large-scale training jobs, this tutorial is tailored for you.

According to [Facebook's LLaMA 3.1 paper](https://arxiv.org/abs/2407.21783), approximately **30% of failed training jobs resulted from malfunctioning GPUs**. However, hardware issues are not the only concerns; other difficulties may emerge. We will cover best practices for identifying bugs in distributed Python code, how to approach inexplicable NCCL errors, and address data-related training obstacles.



## Tutorial Overview & What You'll Learn

### [**Lessons Learned** — Model Divergence, Cluster Debugging, NCCL Errors](../lessons)
Let's start with what problems we came across and their solutions.
- **Resolving Model Convergence Problems**: Learn how to tackle issues when your model does not converge as anticipated.
- **Debugging On a Clusters**: Discover how to utilize [py-spy](https://github.com/benfred/py-spy) for debugging cluster-wide running code. We will debug the distributed training data loader as an example.
- **Random NCCL Errors**: Obtain advice on handling the intricacies of training on a cluster.


### [**Setup** — Clone, Install & Setup your Cluster](../setup)
To begin training, we'll go through the following steps to set everything up:
- **Basic Setup**:
    - We'll guide you through cloning and configuring the required codebase.
    - Installing conda & dependencies
- **Preparing the Cluster**:
    - Making sure that all nodes have access to needed files (dataset, huggingface weights, conda environments)
    - Defining the nodes list for the training job
    - Setting up Weights & Biases (wandb)


### [**Dataset** — Downloading & Preprocessing](../dataset)
Let's face it: Video data is not easily accessible, and there aren't many public sources available.  
For our reproduction experiment, we will:
- Download [**OpenVid**](https://github.com/NJU-PCALab/OpenVid-1M) and [**MiraData**](https://github.com/mira-space/MiraData) datasets.
- Go through the essential steps to **preprocess the datasets**.
- Discuss how to efficiently **parallelize** preprocessing tasks using your cluster without writing any code, by leveraging Unix's built-in capabilities.


### [**Training** — Get the Ball Rolling](../training)
And of course, let's start training! Training on a larger scale comes with its own set of challenges. Here's what we will address:
- **Training Configurations**: We will recommend settings for a speed run (18k GPU hours) and an additional 7k GPU hours run to enhance the results. We will discuss the expectations from each setting and share intermediate and final results for our runs.
- **Starting and Monitoring Training on a Cluster**: Open-Sora is built on top of the [ColossalAI launcher](https://colossalai.org/). We'll start by simply providing the commands to get you started and how to monitor loss curves in [weights and biases](https://wandb.com).
- **Evaluating Model Quality**: Learn how to assess model performance using a separate inference server.
- **Monitoring Cluster Health**: Large-scale distributed training often faces the challenge of downtime, which can be both experienced and should be carefully tracked during the process.


By the end of this tutorial, you'll have a comprehensive understanding of what's involved in scaling up T2V models like Open-Sora 1.2. You'll be better equipped to handle the challenges that come with large-scale training and better prepared to troubleshoot and optimize your models effectively.
It's time to dive right in In the [next section](../lessons), we'll share insights on various challenges we faced—from finding data loader bugs that led to diverging training, to debugging issues in worker code that appeared randomly across the cluster, and tackling low-level problems with NCCL on a bare-metal setup.


<br/>

---

**So Let's Get Started!**

Before we jump into setting everything up, we'd like to share some valuable lessons we learned along the way. In the [next section](../lessons), we'll delve into the challenges we faced — from uncovering data loader bugs that caused training divergence, to debugging elusive issues in worker code that appeared randomly across the cluster, and tackling low-level problems with NCCL on a bare-metal setup.

---