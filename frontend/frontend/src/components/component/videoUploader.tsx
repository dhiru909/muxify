'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import {
  completeMultiPartUpload,
  getMultiplePresignedUrls,
  getSinglePresignedUrl,
  startMultiPartUpload,
  videoUploaded,
} from '../../api/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { toast } from '../ui/use-toast';

type VideoLocalData = {
  fileName?: string;
  fileSize?: Number;
  uuid?: string;
  etag?: string;
  presignedUrls?: string[];
  parts?: [
    {
      etag: string;
      PartNumber: Number;
    },
  ];
};
export default function VideoUploader() {
  const [videoData, setVideoData] = useState<VideoLocalData | null>();
  const [localFileName, setLocalFileName] = useState('');
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const { userInfo } = useSelector((state: any) => state.authenticate);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  // @ts-ignore
  const {
    data: presignedUrlResponse,
    isError: errorFetchingPresignedUrl,
    mutate: fetchSinglePresignedUrlMutate,
  } = useMutation({
    mutationKey: ['presignedUrls', file?.name],
    mutationFn: getSinglePresignedUrl,
    onSuccess(data: string, variables: string, context: any) {
      setPresignedUrl(data.url);
      console.log('data', data);
    },
  });
  const { isError: errorUploadingVideo, mutate: videoUploadedMutate } =
    useMutation({
      mutationKey: ['videos', file?.name],
      mutationFn: videoUploaded,
      onSuccess(data: string, variables: string, context: any) {
        console.log('data', data);
        toast({
          title: 'Success',
          description: 'Video uploaded successfully',
          variant: 'default',
        });
      },
    });
  useEffect(() => {
    (async () => {
      if (presignedUrl !== null) {
        console.log(presignedUrl);
        console.log(file?.type);
        setUploading(true);
        try {
          // Use the presigned URL to upload the file to S3
          const uploadResponse = await fetch(presignedUrl, {
            body: file,
            method: 'PUT',
            headers: {
              'Content-Type': file?.type!,
            },
          });

          if (uploadResponse.ok) {
            const formData = {
              title: file?.name,
              uuid: localFileName,
              status: 'UPLOADED',
              etag: uploadResponse.headers.get('ETag')!,
            };
            const accessToken = userInfo?.accessToken;
            console.log(userInfo?.accessToken);

            videoUploadedMutate({ data: formData, accessToken });
            console.log(uploadResponse);
            setUploadStatus('success');
            setFile(null);
          } else {
            setUploadStatus('error');
            console.error('Upload failed:', uploadResponse.statusText);
          }
        } catch (error) {
          setUploadStatus('error');
          console.error('Upload error:', error);
        } finally {
          setUploading(false);
        }
      }
    })();
  }, [presignedUrl]);

  useEffect(() => {
    console.log(localFileName);
    if (localFileName && videoData) {
      localStorage.setItem(localFileName, JSON.stringify(videoData));
    }
  }, [videoData, localFileName]);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setVideoData(null);
      setFile(event.target.files[0]);
      setUploadStatus('idle');
      setLocalFileName(event.target.files[0].name!);
      console.log(localFileName);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      console.log(file);
      var re = /(?:\.([^.]+))?$/;
      let extension = re.exec(file?.name!)![0];
      console.log();

      if (file.size < 11000000) {
        const fileName = uuidv4() + extension;
        setLocalFileName(fileName);
        const accessToken = userInfo?.accessToken;
        const fileType = file?.type;
        setUploading(true);
        setUploadProgress(10);
        setUploadStatus('idle');
        fetchSinglePresignedUrlMutate({ fileName, accessToken, fileType });
      } else {
        console.log(file?.name);

        let localDataOfVideo = await localStorage.getItem(file?.name);

        if (localDataOfVideo) {
          let data = JSON.parse(localDataOfVideo);
          console.log(data);
          setVideoData(prev => (prev ? { ...prev, ...data } : data));
        }
        console.log(videoData);

        let fileName = '';
        if (videoData?.uuid) {
          fileName = videoData?.uuid!;
        } else {
          fileName = uuidv4() + extension;
          // setLocalFileName(fileName)
          setVideoData(data => ({
            ...data,
            fileName: file?.name,
            uuid: fileName,
          }));
        }
        const accessToken = userInfo?.accessToken;
        const fileType = file?.type;
        setUploading(true);
        setUploadProgress(0);
        setUploadStatus('idle');
        let presignedUrls: string[] = [];
        let uploadId = '';
        const fileSize = file.size;
        const chunkSize = 10000000;
        let totalChunks = Math.ceil(fileSize / chunkSize);
        if (videoData?.presignedUrls) {
          presignedUrls = videoData?.presignedUrls;
        } else {
          const res = await startMultiPartUpload(
            fileName,
            fileType,
            accessToken,
          );
          uploadId = res.uploadId;
          console.log(uploadId);

          const resPresSignedUrl = await getMultiplePresignedUrls(
            fileName,
            uploadId,
            totalChunks,
            accessToken,
          );
          presignedUrls = resPresSignedUrl.presignedUrls;
          setVideoData(data => ({
            ...data,
            presignedUrls: presignedUrls,
          }));
        }

        console.log('pres', presignedUrls);
        let parts: any = [];

        for (let i = 0; i < totalChunks; i++) {
          let start = i * chunkSize;
          let end = Math.min(start + chunkSize, fileSize);
          let chunk = file.slice(start, end);
          let presignedUrl = presignedUrls[i];
          if (videoData?.parts) {
            if (videoData?.parts[i]) {
              parts.push(videoData?.parts[i]);
            } else {
              const response = await axios.put(presignedUrl, chunk, {
                headers: {
                  'Content-Type': file.type,
                },
                onUploadProgress(progressEvent) {
                  setUploadProgress(prev =>
                    Math.max(
                      prev,
                      Math.round(
                        (((progressEvent.loaded * 100) / progressEvent.total) *
                          (i + 1)) /
                          totalChunks,
                      ),
                    ),
                  );
                },
              });
              parts.push({
                etag: response.headers.get('etag'),
                PartNumber: i + 1,
              });
              setVideoData(data => ({
                ...data,
                parts: parts,
              }));
              console.log(response.headers);
            }
          } else {
            const response = await axios.put(presignedUrl, chunk, {
              // body: chunk,
              // method: 'PUT',
              headers: {
                'Content-Type': file.type,
              },
              onUploadProgress(progressEvent) {
                setUploadProgress(prev =>
                  Math.max(
                    prev,
                    Math.round(
                      (((progressEvent.loaded * 100) / progressEvent.total) *
                        (i + 1)) /
                        totalChunks,
                    ),
                  ),
                );
              },
            });
            parts.push({
              etag: response.headers.get('etag'),
              PartNumber: i + 1,
            });
            setVideoData(data => ({
              ...data,
              parts: parts,
            }));
            console.log(response.headers);
          }

          // setUploadProgress(((i + 1) / totalChunks) * 100);
        }
        let complete_upload = await completeMultiPartUpload(
          fileName,
          uploadId,
          parts,
          accessToken,
        );
        const formData = {
          title: file?.name,
          uuid: fileName,
          status: 'UPLOADED',
          etag: complete_upload.fileData.ETag,
        };
        //  const accessToken = userInfo?.accessToken;
        console.log(userInfo?.accessToken);
        console.log("sfaf",fileName);
        
        videoUploadedMutate({ data: formData, accessToken });
        setUploadStatus('success');
        console.log(complete_upload);
        setVideoData(data => ({
          ...data,
          etag: complete_upload.fileData.ETag,
        }));
        localStorage.removeItem(file?.name);
        setFile(null);
        console.log(parts);
        setUploading(false);
      }
    } catch (error) {
      setUploadStatus('error');
      console.error('Upload failed:', error);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-primary-background border-grey-400 border-2 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Video Uploader</h2>
      <div className="mb-4">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="w-full"
        >
          Select Video
        </Button>
        {file && (
          <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>
        )}
      </div>
      <Button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full mb-4"
      >
        {uploading ? 'Uploading...' : 'Upload Video'}
        <Upload className="ml-2 h-4 w-4" />
      </Button>
      {uploading && <Progress value={uploadProgress} className="mb-2" />}
      {uploadStatus === 'success' && (
        <div className="flex items-center text-green-600">
          <CheckCircle className="mr-2 h-4 w-4" />
          Upload successful!
        </div>
      )}
      {uploadStatus === 'error' && (
        <div className="flex items-center text-red-600">
          <AlertCircle className="mr-2 h-4 w-4" />
          Upload failed. Please try again.
        </div>
      )}
    </div>
  );
}
