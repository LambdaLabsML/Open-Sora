---
layout: post
icon: fas fa-database
title: Dataset
date: 2024-10-16
toc: true
order: 4
---

# Downloading & Preprocessing
Let's face it: video data is not easily accessible, and there aren't many publicly available sources. In this section, we'll guide you through downloading the necessary datasets, preprocessing the data, and ensuring it's ready for training the Open-Sora model.

> **Note:** Ensure you have sufficient storage space and bandwidth to download these large datasets. The total required disk space is `~37TB`.
{: .prompt-tip}

## **Download the Datasets**
We'll be using two primary datasets for our reproduction experiment:
* **[OpenVid](https://github.com/NJU-PCALab/OpenVid-1M)**: Contains 1 million short video clips and corresponding captions.  
  You can download the dataset from their [Huggingface link](https://huggingface.co/datasets/nkp37/OpenVid-1M).  
* **[MiraData](https://github.com/mira-space/MiraData)**: Contains 330k (but different splits exists too) long video clips and corresponding captions.  
  For MiraData, we'll follow the guidance from the author's [repository](https://github.com/mira-space/MiraData/tree/v1?tab=readme-ov-file#download) to download the **330K** version of the dataset (the meta file we use is `miradata_v1_330k.csv`).  
* **Custom Dataset**: Our guide also covers how to use your own video data set consisting of video clips and corresponding captions.

**Dataset Summary**

Dataset | License | Dataset Size | Clip Dimensions | Required Disk Space
--------| ------- | ------------ | --------------- | -------------------
OpenVid | CC-BY-4.0 | 1M Clips & Captions | Various Resolutions & Aspect Ratios | 7.9TB                    
MiraData | GPL-3.0 | 330k Clips & Captions | `1280x720` and `1920x1080`  | 29TB                    


## **Preprocessing the Datasets**
Both OpenVid and MiraData come with video clips and captions. Therefore, we can skip most of the preprocessing steps outlined in the [Open-Sora data processing guide](https://github.com/hpcaitech/Open-Sora/blob/main/docs/data_processing.md). However, we still need to add missing metadata to the CSV file for training purposes and filter out any large or unsupported files.

### **Required Columns for Training**
To train using the Open-Sora code base, a CSV file with specific columns is required. The necessary columns are: `path`, `text`, `num_frames`, `height`, `width`, `aspect_ratio`, `fps`, `resolution`, and `file_size`.

But thankfully, there's a script to generate most of these columns from only `path` and `text`.
If you have a CSV file (`dataset.csv`{: .filename}) containing the `path` and `text` columns, you can compute the remaining required columns from these two by executing the following command:

```bash
python -m tools.datasets.datautil dataset.csv --info --remove-empty-caption
```
The command will execute concurrently, generating a new file named `dataset_info_noempty.csv`{: .filename}. This file will contain all the required metadata columns and exclude any entries with empty captions.

### **Filtering Large Video Clips**
To optimize training performance, we remove video clips larger than `50MB`, as they are more expensive to load during training.

```bash
python -m tools.datasets.filter_large_videos dataset_info_noempty.csv 50
```
This results in a new file called `dataset_info_noempty_le50MB.csv`{: .filename}.


### **Filtering Broken and Unsupported Files**
Open-Sora uses `ffmpeg` under the hood to open files on-the-fly.
Some video clips may cause FFMPEG warnings or errors, and, in the worst case: crash the training process. To prevent this, we need to filter out files that FFMPEG cannot decode. This process is CPU-intensive, so we'll parallelize it across multiple servers.

The idea of filtering is simple: read each file with ffmpeg, write to a file called `$filename.err` and then filter using the file size of the error file.

> **Warning:** This filtering process can be time-consuming depending on the size of your dataset and the number of nodes available for parallel processing.
{: .prompt-tip}

### **Steps to Filter Out Problematic Video Clips**

1. **Create `filenames.txt` containing only all filenames:**  
   To extract the `path` column from `dataset_info_noempty_le50MB.csv` and save it to `filenames.txt`:
   ```bash
   python -c "import pandas as p, sys; p.read_csv(sys.argv[1]).path.to_csv(sys.argv[2], index=0, header=0)" dataset_info_noempty_le50MB.csv filenames.txt
   ```
2. **Split `filenames.txt` into Sub-Lists for Parallel Processing:**  
   Assuming you have `24` nodes available for checking, split `filenames.txt` into 24 sub-lists:
   ```bash
   split -n l/24 filenames.txt part_
   ```
   This will create files named `part_aa`, `part_ab`, ..., `part_az`.
3. **Adapt and Run the FFMPEG Check Script on All Nodes**  
   The following script will create `.err` files alongside each video file in `filenames.txt`. An empty `.err` file indicates no errors, while a non-empty file signifies an FFMPEG error with that video.

   ```bash
   paste nodes.txt <(ls ./data_csvs/part_* | sort) | parallel --colsep '\t' ssh -tt {1} "bash $(pwd)/tools/datasets/ffmpeg_check_parallel.sh $(pwd)/{2}"
   ```
4. **Filter Out Files with FFMPEG Errors**  
   Use the following Python script to filter out video files that have FFMPEG errors:
   ```python
   python -m tools.datasets.ffmpeg_filter_without_errors dataset_info_noempty_le50Mb.txt
   ```

   This will generate a new file named `dataset_info_noempty_le50Mb_withouterror.txt`{: .filepath} excluding the problematic video clips, ensuring a stable training dataset.


## **Storing the Dataset on Shared Storage**

After preprocessing, we make sure that all compute nodes have access to the preprocessed dataset, store it on a shared storage system accessible by all nodes.

For the remainder of this tutorial, we'll suggest that the filtered CSVs are saved in the training repository as follows:
- the CSV for OpenVid data under `OpenVid1M.csv`{: .filepath}
- the combined CSV for OpenVid and MiraData data under `OpenVid1M-Miradata330k.csv`{: .filepath}

> **Important:** Ensure that the shared storage is mounted and accessible from all nodes in your cluster before initiating the training process.
{: .prompt-tip}


<br/>

---

**What Next?**:  
By following these steps, you've successfully downloaded, preprocessed, and prepared the dataset required for training the Open-Sora model. You're now ready to proceed to the next stage: training the model on your cluster.

Proceed to the [**Training** — Get the Ball Rolling](../training) section to begin training!

---
