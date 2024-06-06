OMP_NUM_THREADS=52 colossalai run --nproc_per_node 8 \
	--hostfile hostfile_1cc \
	--master_addr 172.26.133.123 \
	scripts/train.py \
	configs/opensora-v1-1/train/attn_over_everything.py \
	--data-path /home/ubuntu/ml-1cc/legos/lego_24k_15k_2k.csv \
	--ckpt-path /home/ubuntu/ml-1cc/model/OpenSora-STDiT-v2-stage3/model.safetensors

