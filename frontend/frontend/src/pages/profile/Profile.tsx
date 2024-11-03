import React, { useEffect, useRef, useState } from 'react';
import { RiseLoader } from 'react-spinners';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import {
  useMutation,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getTotalVideoCount, getVideos } from '@/api/api';
import { Button } from '@/components/ui/button';
import { z } from 'zod';

import VideoList from '@/components/component/video-list';
import Loader from '@/components/component/loader';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  description: z.string().min(2, 'Description is required.'),
  address: z.string().min(1, {
    message: 'Address is required.',
  }),
  type: z
    .string()
    .min(3, {
      message: 'Type is required',
    })
    .max(14, 'Password must be at most 14 characters'),
  file: z.instanceof(FileList).optional(),
});
const useTitle = (title: any) => {
  const documentDefined = typeof document !== 'undefined';
  const originalTitle = React.useRef(documentDefined ? document.title : null);

  React.useEffect(() => {
    if (!documentDefined) return;

    if (document.title !== title) document.title = title;

    return () => {
      document.title = originalTitle.current!;
    };
  }, []);
};

const Profile = () => {
  // @ts-ignore
  useTitle('Profile');
  const [error, setError] = useState(null);
  const [pageNo, setPageNo] = useState(1);
  const { userInfo } = useSelector((state: any) => state.authenticate);

  const accessToken = userInfo?.accessToken;
  const [pageCount, setPageCount] = useState<number | null>(null);
  const decrementPageNo = () => {
    if (pageNo > 1) {
      setPageNo(page => page - 1);
    }
  };

  const {
    data: videos,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['videos', pageNo],
    queryFn: () =>
      getVideos({
        data: { page: pageNo, limit: 10 },
        accessToken: accessToken,
      }),
    enabled: false,
    // refetchInterval: 5000,
    refetchIntervalInBackground: true,
    retry: 1,
    retryDelay: 3000,
    staleTime: 60000,
    gcTime: 1000 * 60,
  });
  const {
    data: pages,
    isError: isErrorFetchingPages,
    isFetching: isFetchingPages,
    isSuccess: successFetchingPages,
  } = useQuery({
    queryKey: ['pages'],
    queryFn: () =>
      getTotalVideoCount({
        accessToken: accessToken,
      }),
  });
  const incrementPageNo = () => {
    if (pageNo < pageCount!) {
      setPageNo(page => page + 1);
    }
  };
  useEffect(() => {
    if (pageCount >= 0) {
      refetch();
    }
  }, [pageNo, pageCount]);
  useEffect(() => {
    if (successFetchingPages) {
      setPageCount(Math.ceil(pages / 10));
    }
  }, [pages]);

  const navigate = useNavigate();
  const [uploadImages, setUploadImages] = useState();
  const queryClient = useQueryClient();
  return (
    <>
      <div className={`mt-[5.25rem] flex flex-col min-h-dvh`}>
        <header className="body bg-primary-background  py-12 md:py-16 lg:py-20">
          <div className="container flex flex-col items-center text-center gap-4">
            <Avatar className="w-24 h-24 md:w-32 md:h-32">
              <AvatarImage src={userInfo?.dp} />
              {/* <AvatarFallback>{userInfo?.name.charAt(0)}</AvatarFallback> */}
            </Avatar>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-primary-background md:text-4xl">
                {userInfo?.username}
              </h1>
              {/* <div class="glitch-wrapper">
                <div class="glitch" data-text="Glitch Text">
                  Glitch Text
                </div>
              </div> */}
              {/* <p className="text-muted-foreground md:text-lg">
                {userInfo?.email}
              </p> */}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 text-center ">
          <div className="flex justify-between items-center h-fit px-8">
            <h1 className="text-2xl font-bold mb-1 text-start pl-4 ">
              Your Transcoded Videos
            </h1>
            <Button
              onClick={() => {
                navigate('/home', {
                  // replace: true,
                  relative: 'path',
                });
              }}
              className="mb-2"
            >
              Upload
            </Button>
          </div>
          <Separator className="mb-3" />
          {!videos && (
            <RiseLoader className="mt-6" color="pink" cssOverride={{}} />
          )}
          <VideoList videos={videos?.videos} />
          <Pagination className="mb-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => decrementPageNo()}
                  aria-disabled={pageNo <= 1}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink>{pageNo}</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => {
                    incrementPageNo();
                  }}
                  aria-disabled={pageNo >= pageCount}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </main>
        <footer className="bg-muted p-6 md:py-12 w-full">
          <div className="container max-w-7xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-sm">
            <div className="grid gap-1">
              <h3 className="font-semibold">Company</h3>
              <Link href="#" prefetch={false}>
                About Us
              </Link>
              <Link href="#" prefetch={false}>
                Our Team
              </Link>
              <Link href="#" prefetch={false}>
                Careers
              </Link>
              <Link href="#" prefetch={false}>
                News
              </Link>
            </div>
            <div className="grid gap-1">
              <h3 className="font-semibold">Services</h3>
              <Link href="#" prefetch={false}>
                Construction Management
              </Link>
              <Link href="#" prefetch={false}>
                Project Planning
              </Link>
              <Link href="#" prefetch={false}>
                Safety Compliance
              </Link>
              <Link href="#" prefetch={false}>
                Quality Assurance
              </Link>
            </div>
            <div className="grid gap-1">
              <h3 className="font-semibold">Resources</h3>
              <Link href="#" prefetch={false}>
                Blog
              </Link>
              <Link href="#" prefetch={false}>
                Case Studies
              </Link>
              <Link href="#" prefetch={false}>
                Industry News
              </Link>
              <Link href="#" prefetch={false}>
                FAQs
              </Link>
            </div>
            <div className="grid gap-1">
              <h3 className="font-semibold">Legal</h3>
              <Link href="#" prefetch={false}>
                Privacy Policy
              </Link>
              <Link href="#" prefetch={false}>
                Terms of Service
              </Link>
              <Link href="#" prefetch={false}>
                Compliance
              </Link>
            </div>
            <div className="grid gap-1">
              <h3 className="font-semibold">Contact</h3>
              <Link href="#" prefetch={false}>
                Support
              </Link>
              <Link href="#" prefetch={false}>
                Sales
              </Link>
              <Link href="#" prefetch={false}>
                Partnerships
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

function GithubIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function MapPinIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default Profile;
