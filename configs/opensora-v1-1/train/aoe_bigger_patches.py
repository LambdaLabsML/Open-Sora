# Define dataset
dataset = dict(
    type="VariableVideoTextDataset",
    data_path=None,
    num_frames=None,
    frame_interval=4,
    image_size=(None, None),
    transform_name="resize_crop",
)
bucket_config = {
    "360p": {1: (1.0, 256), 32: (1.0, 8), 64: (1.0, 4)},
    "480p": {1: (0.5, 128), 32: (0.5, 4), 64: (0.5, 2)},
}
mask_ratios = None

# Define acceleration
num_workers = 8
num_bucket_build_workers = 16
dtype = "bf16"
grad_checkpoint = True
plugin = "zero2"
sp_size = 1

# Define model
model = dict(
    type="STDiT2-XL/2",
    from_pretrained=None,
    input_sq_size=512,  # pretrained model is trained on 512x512
    qk_norm=True,
    enable_flash_attn=True,
    enable_layernorm_kernel=True,
    patch_size=(3, 2, 2),
    patch_stride=(2, 2, 2),
)
vae = dict(
    type="VideoAutoencoderKL",
    from_pretrained="stabilityai/sd-vae-ft-ema",
    micro_batch_size=4,
    local_files_only=True,
)
text_encoder = dict(
    type="t5",
    from_pretrained="DeepFloyd/t5-v1_1-xxl",
    model_max_length=200,
    shardformer=True,
    local_files_only=True,
)
scheduler = dict(
    type="iddpm",
    timestep_respacing="",
)
scheduler_inference = dict(
    type="iddpm",
    num_sampling_steps=300,
    cfg_scale=7.0,
    cfg_channel=3,  # or None
)

# Others
seed = 1024
outputs = "outputs"
wandb = True

epochs = 1000
log_every = 10
ckpt_every = 250
load = None

lr_schedule = "1cycle"
anneal_strategy = "cos"
warmup_steps = 1000
cooldown_steps = 1000
lr = 1e-5
min_lr = 1e-7
max_lr = 4e-5

batch_size = None
grad_clip = 1.0

eval_prompts = [
        "A scuba diver on a coral reef with schools of fish swimming, and a sea turtle and an octopus.",
        "Two pirate ships battling each other with canons as they sail inside a cup filled with coffee. The two pirate ships are fully in view, and the camera view is an aeriel view looking down at a 45 degree angle at the ships.",
        "People eating ice cream and drinkin espresso outside of a cafe on a narrow street in Rome. There are stores along the street selling a variety of wares. One shop sells fruits. Another shop sells vegetables. A third shop sells christmas ornaments. Many people walk along the street.",
        "An astronaut walking on the moon, with the effects of gravity making the walk appear very bouncy.",
        "A person walks down a garden path. The path is surrounded by gorgeous and colorful flowers, lush bushes, and grand trees. Butterflies and bees zip around the scene in the background. The person is walking directly towards the camera.",
        "A shot of the sunset from a beautiful beach with white sand and crashing waves. No people or animals in sight. Few clouds that are lit up in orange and red from the sunset. The Sun is halfway set.",
        "A majestic lion walking confidently through the savannah, its mane flowing in the wind with each step. The golden sunset casts a warm glow on the scene, highlighting the lion's powerful stride. Tall grasses sway gently around it as it moves, and distant acacia trees are silhouetted against the horizon.",
        "A curious owl turning its head almost 180 degrees and blinking its large, expressive eyes. It is perched on a tree branch in a moonlit forest, with shadows of leaves and branches creating a mystical atmosphere. The owl occasionally fluffs its feathers and tilts its head inquisitively.",
        "A ninja wearing a red outfit jumps from one roof of a building to a second building's roof. The full moon is in sight directly behind the ninja.",
        "An amateur photograph featuring LEGO figures and bricks of: A ninja wearing a red outfit jumps from one roof of a building to a second building's roof. The full moon is in sight directly behind the ninja.",
        "A cowgirl rides a horse across a wide grass field.",
        "An amateur photograph featuring LEGO figures and bricks of: A cowgirl rides a horse across a wide grass field. The scene uses real LEGO pieces, showing surface imperfections, fingerprints, and natural wear. Natural window lighting casts soft shadows, highlighting the textures of the LEGO pieces.",
        "A rock band performs a high energy song on a stage in front of a huge crowd. The camera views the stage from the audience, where part of the view is obstructed by the backs of people's heads. The band members are styled similar to the Kiss rock band.",
        "An amateur photograph featuring LEGO figures and bricks of: A rock band performs a high energy song on a stage in front of a huge crowd. The camera views the stage from the audience, where part of the view is obstructed by the backs of people's heads. The band members are styled similar to the Kiss rock band. The scene uses real LEGO pieces, showing surface imperfections, fingerprints, and natural wear. Natural window lighting casts soft shadows, highlighting the textures of the LEGO pieces.",        
        "A newly married couple do their first dance at a wedding. Both partners are wearing white dresses, and are slow dancing in the center of a beautifully decorated wedding hall.",
        "An amateur photograph featuring LEGO figures and bricks of: A newly married couple do their first dance at a wedding. Both partners are wearing white dresses, and are slow dancing in the center of a beautifully decorated wedding hall. The scene uses real LEGO pieces, showing surface imperfections, fingerprints, and natural wear. Natural window lighting casts soft shadows, highlighting the textures of the LEGO pieces.",        
        "Two knights battle each other on foot with swords and shields. The knights both swing swords at each other and the swords meet in the middle as both knights battle for victory.",
        "An amateur photograph featuring LEGO figures and bricks of: Two knights battle each other on foot with swords and shields. The knights both swing swords at each other and the swords meet in the middle as both knights battle for victory. The scene uses real LEGO pieces, showing surface imperfections, fingerprints, and natural wear. Natural window lighting casts soft shadows, highlighting the textures of the LEGO pieces.",
        "A fat rabbit wearing a purple robe walking through a fantasy landscape",
        "An amateur photograph featuring LEGO figures and bricks of: A fat rabbit wearing a purple robe walking through a fantasy landscape. The scene uses real LEGO pieces, showing surface imperfections, fingerprints, and natural wear. Natural window lighting casts soft shadows, highlighting the textures of the LEGO pieces.",
        "A young man walks alone by the seaside",
        "An amateur photograph featuring LEGO figures and bricks of: A young man walks alone by the seaside. The scene uses real LEGO pieces, showing surface imperfections, fingerprints, and natural wear. Natural window lighting casts soft shadows, highlighting the textures of the LEGO pieces.",
        "Walter White and Jesse Pinkman from breaking bad standing in front of their van in the new mexican desert.",
        "An amateur photograph featuring LEGO figures and bricks of: Walter White and Jesse Pinkman from breaking bad standing in front of their van in the new mexican desert. The scene uses real LEGO pieces, showing surface imperfections, fingerprints, and natural wear. Natural window lighting casts soft shadows, highlighting the textures of the LEGO pieces.",
        "Marty McFly standing in front of the DeLorean, while Doc Brown explains him the two time lines.",
        "An amateur photograph featuring LEGO figures and bricks of: Marty McFly standing in front of the DeLorean, while Doc Brown explains him the two time lines. The scene uses real LEGO pieces, showing surface imperfections, fingerprints, and natural wear. Natural window lighting casts soft shadows, highlighting the textures of the LEGO pieces.",
        "Forrest Gump - A man sits on a park bench with a box of chocolates and tells his story to a person also sitting on the bench.",
        "An amateur photograph featuring LEGO figures and bricks of: Forrest Gump - A man sits on a park bench with a box of chocolates and tells his story to a person also sitting on the bench. The scene uses real LEGO pieces, showing surface imperfections, fingerprints, and natural wear. Natural window lighting casts soft shadows, highlighting the textures of the LEGO pieces.",
        "A cute-looking Jack Nicholson breaking through the door with a axe and shouting ”Here's Johnny!”.",
        "An amateur photograph featuring LEGO figures and bricks of: A cute-looking Jack Nicholson breaking through the door with a axe and shouting ”Here's Johnny!”. The scene uses real LEGO pieces, showing surface imperfections, fingerprints, and natural wear. Natural window lighting casts soft shadows, highlighting the textures of the LEGO pieces.",
        "Frozen - Elsa building her ice castle while singing \"Let It Go\" with snow swirling around her.",
        "An amateur photograph featuring LEGO figures and bricks of: Frozen - Elsa building her ice castle while singing \"Let It Go\" with snow swirling around her. The scene uses real LEGO pieces, showing surface imperfections, fingerprints, and natural wear. Natural window lighting casts soft shadows, highlighting the textures of the LEGO pieces.",
]

eval_image_size = (480, 854)
eval_num_frames = 16
eval_fps = 8
eval_batch_size = 1
eval_steps = ckpt_every

wandb_project_name = "lego-attention"
wandb_project_entity = "lambdalabs"

exp_id = "aoe-bigger-patches-stride1"
