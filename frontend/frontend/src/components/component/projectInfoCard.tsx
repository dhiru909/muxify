import { deleteProject, fetchSingleProject, updateProject } from '@/api/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckIcon,
  LoaderCircleIcon,
  MapPinIcon,
} from 'lucide-react';
import React, {  useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';
import { Card, CardContent } from '../ui/card';
import { useSelector } from 'react-redux';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { toast } from '../ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

// interface Project {
//   location: Location;
//   img: string[];
//   _id: string;
//   title: string;
//   address: string;
//   status: string;
//   type: string;
//   description: string;
//   startedAt: Date;
//   userId: UserID;
//   createdAt: Date;
//   updatedAt: Date;
//   __v: number;
//   // Add other fields as needed
// }
// interface Location {
//   type: string;
//   coordinates: number[];
// }

// interface UserID {
//   _id: string;
//   name: string;
//   dp: string;
// }

const ProjectInfoCard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { id } = useParams<{ id: string }>();
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const { userInfo } = useSelector((state: any) => state.authenticate);
  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);
  // const [project, setProject] = useState<Project | null>(null);
  // const [error, setError] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['all-projects', id],
    queryFn: () => fetchSingleProject(id!),
    // refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60 * 24 * 7,
  });
  const {
    mutate,
    isError
  } = useMutation({
    mutationKey: ['delete-project', { id }],
    mutationFn: deleteProject,

    onSuccess: (data, variables, context) => {
      console.log(data, variables, context);
      toast({
        title: 'Alert',
        description:
          data.deletedCount == 1
            ? 'Project deleted successfully'
            : 'Something went wrong',
        variant: 'default',
        onDoubleClickCapture: () => {
          console.log('double click');
        },
        duration: 3000,
      });

      queryClient.invalidateQueries({
        queryKey: ['all-projects'],
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });
  const {
    mutate: updateMutate,
    isPending: isUpdatePending,
  } = useMutation({
    mutationKey: ['update-project', { id }],
    mutationFn: updateProject,

    onSuccess: (data) => {
      // console.log(data, variables, context);
      toast({
        title: data.project.ok ? 'Success' : 'Error',
        description:
          data.project.ok == 1
            ? 'Project Update successfully'
            : 'Something went wrong',
        variant: 'default',
        onDoubleClickCapture: () => {
          console.log('double click');
        },
        duration: 3000,
      });

      queryClient.invalidateQueries({
        queryKey: ['all-projects'],
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });
  const [files, setFiles] = useState('');
  const [status, setStatus] = useState(data?.status);
  const saveFile = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      // console.log(e.target.files[0]);
      setFiles(e.target.files);
      // console.log(defaultDpFile.name)
      // console.log("chosen file",file.name)
    }
    // setImg(URL.createObjectURL(e.target.files[0]));
    // console.log(img);
  };

  const updateProjectHandler = async () => {
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('img', files[i]);
        // console.log(files[i]);
      }
      formData.append('status', status);
      updateMutate({ id, formData, userInfo });
    } catch (err) {
      console.log('update', err);
    }
  };
  const deleteProjectHandler = async () => {
    try {
      mutate({ id, userInfo });
    } catch (error) {
      console.log(error);
    }
  };
  if (!isLoading && !data) {
    toast({
      title: 'Error ❌',
      description: (
        <>
          Project Not found <br /> Redirecting to homepage
        </>
      ),
      variant: 'destructive',
      onDoubleClickCapture: () => {
        console.log('double click');
      },
      duration: 3000,
    });
    navigate(-1);
  }
  if (isLoading || isError) {
    return (
      <div className="mt-[5.25rem] px-4 py-8 mx-auto sm:px-6 md:max-w-4xl">
        <div className="animate-spin ease-in-out shadow-2xl shadow-slate-900  rounded-full border-8 w-14 h-14 border-r-primary-background absolute top-2/4 left-2/4 z-10"></div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            <Skeleton className="h-12 " />
          </h1>
          <div className="flex gap-2">
            <Skeleton className="h-12 w-28" />
            <Skeleton className="h-12 w-28" />
            <Skeleton className="h-12 w-28" />
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPinIcon className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  <Skeleton className=" h-12 w-28" />
                </div>
                <div className="text-sm text-muted-foreground">
                  <Skeleton className="mt-2 h-12" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <CheckIcon className="w-5 h-5 text-green-500" />
              <div className="text-green-500">
                <Skeleton className="h-12" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  <Skeleton className="h-12" />
                </div>
                <div>
                  <Skeleton className="h-12" />
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Started on
                </div>
                <div>
                  <Skeleton className="h-12" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
            <div className="prose">
              <h2>Description</h2>
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          </div>
          <div className="grid gap-4">
            <Carousel
              setApi={setApi}
              opts={{
                align: 'center',
              }}
              orientation="vertical"
              className=" max-w-sm p-0 mt-4 "
            >
              <CarouselContent>
                {data?.img.map((image: any, index: any) => (
                  <CarouselItem
                    key={index}
                    className="md:basis-1/2 lg:basis-1/2"
                  >
                    <div className="">
                      <Card>
                        <CardContent className="flex aspect-square items-center justify-center p-0">
                          <img src={image} className="" />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center"></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className=" mt-[5.25rem] py-12 md:py-16 px-4  mx-auto sm:px-6 md:max-w-4xl">
        <div className="flex flex-col md:flex-row items-center  justify-between gap-5 mb-6 animate ease-out animate-fadeIn">
          <h1 className="text-4xl font-bold">{data?.title}</h1>
          <div className="flex gap-2 items-center content-center">
            {userInfo?.id == data?.userId?._id && (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={isUpdatePending}
                      className="gap-1"
                    >
                      {isUpdatePending && (
                        <LoaderCircleIcon className="animate-spin" />
                      )}
                      Update
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Update {data?.title}</DialogTitle>
                      <DialogDescription>
                        Make changes to the property details here.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="type" className="text-right">
                          Status
                        </Label>
                        <Select required onValueChange={e => setStatus(e)}>
                          <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder={data?.status} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Started">Started</SelectItem>
                            <SelectItem value="Ongoing">Ongoing</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="images" className="text-right">
                          Add more Images
                        </Label>
                        <Input
                          onChange={saveFile}
                          id="images"
                          type="file"
                          accept="image/*"
                          multiple
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button onClick={updateProjectHandler} type="submit">
                          Save changes
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Delete</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[90vw] sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Delete project</DialogTitle>
                      <DialogDescription>
                        Are you sure want to delete this project
                      </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                      <Button
                        variant={'destructive'}
                        type="submit"
                        onClick={deleteProjectHandler}
                      >
                        Confirm
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}
            {userInfo?.id != data?.userId._id && (
              <Link
                to={`/profile/${data?.userId?._id}`}
                className="inline-flex items-center gap-2 rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                // prefetch={false}
              >
                View Owner Info
              </Link>
            )}
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <div className=" items-start text-start content-start w-full md:items-start md:text-start gap-4">
            <Carousel
              setApi={setApi}
              opts={{
                align: 'center',
                loop: true,
                active: true,
              }}
              orientation="horizontal"
              className="text-center  rounded-md items-center  md:mr-8 p-0 mt-6"
            >
              <CarouselContent>
                {data?.img.map((image: any, index: any) => (
                  <CarouselItem key={index} className="">
                    <div className=" h-96 ">
                      <Card>
                        <CardContent className="overflow-y-scroll  flex aspect-square items-center justify-center p-0">
                          <img src={image} className="rounded-md" />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
            <div className="py-1 text-center text-sm text-muted-foreground">
              Image {current} of {count}
            </div>
          </div>
          <div className="md:pr-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPinIcon className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{data?.address}</div>
                {/* <div className="text-sm text-muted-foreground">
                  Santa Cruz, CA
                </div> */}
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <CheckIcon className="w-5 h-5 text-green-500" />
              <div className="text-green-500">{data?.status}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Type
                </div>
                <div>{data?.type}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Started on
                </div>
                <div>{data?.startedAt.slice(0, 10)}</div>
              </div>
            </div>
            <div className="grid items-center  gap-2 mb-4">
              <Button variant="outline">View on Map</Button>
            </div>
            <div className="prose">
              <h2 className="text-xl text-center  pb-1 rounded-sm">
                Description
              </h2>
              <p className="border-2 rounded-md p-2 mt-3">
                {data?.description}
              </p>
            </div>
          </div>
        </div>
      </div>{' '}
    </>
  );
};

export default ProjectInfoCard;
