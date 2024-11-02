import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Download, RefreshCw, Upload } from 'lucide-react';

import VideoThumbnail from 'react-video-thumbnail';
import { Badge } from '../ui/badge';
type VideoQuality = '360p' | '480p' | '720p' | '1080p';

type VideoStatus = 'UPLOADING' | 'UPLOADED' | 'TRANSCODING' | 'TRANSCODED';
interface Video {
  id: string;
  title: string;
  thumbnail: string;
  status: VideoStatus;
  qualities: Record<VideoQuality, string>;
}

interface VideoListProps {
  videos: Video[];
}

export default function VideoList({ videos = [] }: VideoListProps) {
  const qualities: VideoQuality[] = ['360p', '480p', '720p', '1080p'];
  const getStatusIcon = (status: VideoStatus) => {
    switch (status) {
      case 'UPLOADING':
        return <Upload className="w-4 h-4" />;
      case 'UPLOADED':
        return <CheckCircle className="w-4 h-4" />;
      case 'TRANSCODING':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'TRANSCODED':
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: VideoStatus) => {
    switch (status) {
      case 'UPLOADING':
        return 'bg-yellow-500';
      case 'UPLOADED':
        return 'bg-blue-500';
      case 'TRANSCODING':
        return 'bg-purple-500';
      case 'TRANSCODED':
        return 'bg-green-500';
    }
  };
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Transcoded Videos</h1>
      <Separator className="mb-2" />
      <div className="flex items-center text-center justify-center flex-col md:flex-row md:flex-wrap gap-6 bg-transparent">
        {videos.map(video => (
          <Card
            key={video.id}
            className="overflow-hidden h-fit bg-primary-background  flex-grow min-w-[20rem] max-w-[22rem] "
          >
            <CardHeader className="p-0  max-h-48 ">
              <VideoThumbnail
                videoUrl={video.thumbnail}
                thumbnailHandler={(thumbnail: any) => console.log(thumbnail)}
                height={200}
              />
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg mb-2">
                {video.title}
                <Badge
                  className={`relative left-2 justify-center w-fit ${getStatusColor(video.status)}  text-white`}
                >
                  <span className="flex items-center gap-1">
                    {getStatusIcon(video.status)}
                    {video.status}
                  </span>
                </Badge>
              </CardTitle>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 p-4 bg-muted justify-center space-x-2">
              {qualities.map(quality => (
                <Button
                  key={quality}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  // disabled={
                  //   video.status !== 'TRANSCODED'
                  // }

                  hidden={true}
                  asChild
                >
                  <a
                    href={video.qualities[quality]}
                    className={`disabled ${video.status !== 'TRANSCODED' ? 'hidden' : 'visible'}`}
                    download
                  >
                    <Download className="w-4 h-4" />
                    {quality}
                  </a>
                </Button>
              ))}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}