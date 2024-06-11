OMP_NUM_THREADS=52 TOKENIZERS_PARALLELISM=false colossalai run --nproc_per_node 8 \
	--hostfile hostfile_1cc \
	--master_addr 172.26.133.123 \
	scripts/train.py \
	configs/opensora-v1-1/train/aoe_bigger_patches.py \
	--data-path /home/ubuntu/ml-1cc/legos/lego_24k_15k_2k.csv

