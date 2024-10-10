// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { fetchProjectsOfUSer, getUserDetails, uploadProject } from '@/api/api';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { IoCloseCircleOutline } from 'react-icons/io5';
import { useGeocodingCore } from '@mapbox/search-js-react';
import { toast } from '@/components/ui/use-toast';
import { LoaderCircleIcon } from 'lucide-react';
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

const Profile = () => {
  // @ts-ignore
  const [error, setError] = useState(null);
  const [addProjectCardVisible, setAddProjectCardVisible] = useState(false);
  const { userInfo } = useSelector((state: any) => state.authenticate);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [uploadImages, setUploadImages] = useState();
  const queryClient = useQueryClient();
  const {
    mutate: uploadMutate,
    // @ts-ignore
    isError: errorUploadingProject,
    // @ts-ignore
    reset: resetUpload,
    isPending: isUploadPending,
  } = useMutation({
    mutationKey: ['upload-project', { id }],
    mutationFn: uploadProject,
    // @ts-ignore
    onSuccess: (data, variables, context) => {
      // console.log(data, variables, context);
      toast({
        title: data.project ? 'Success' : 'Error',
        description: data.project
          ? 'Project Uploaded successfully'
          : 'Something went wrong',
        variant: 'default',
        onDoubleClickCapture: () => {
          console.log('double click');
        },
        duration: 5000,
      });
      setAddProjectCardVisible(false);
      queryClient.invalidateQueries({
        queryKey: ['all-projects'],
      });
    },
    onError: (error, variables, context) => {
      console.log(error);
    },
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    try {
      const formData = new FormData();
      if (uploadImages) {
        for (let i = 0; i < uploadImages?.length; i++) {
          formData.append('img', uploadImages[i]);
        }
      }

      formData.append('title', values.title);
      formData.append('location', JSON.stringify(latLng));
      formData.append('description', values.description);
      formData.append('type', values.type);
      formData.append('status', `Started`);
      formData.append('address', values.address);
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const date = today.getDate();
      formData.append(
        'startedAt',
        `${month.toString().padStart(2, '0')}/${date.toString().padStart(2, '0')}/${year}`,
      );
      uploadMutate({ formData, userInfo });

      console.log(formData);

      // if (res.status === 201) {
      // }
    } catch (err: any) {}
  };

  const addProjRef: React.RefObject<HTMLDivElement> =
    useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addProjRef.current &&
        !addProjRef.current.contains(event.target as Node)
      ) {
        setAddProjectCardVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      address: '',
      type: 'Apartment',
    },
  });
  const { handleSubmit, formState, control } = form;
  const { isSubmitting } = formState;
  /**
   * State for storing the projects
   * @type {MapProps | undefined}
   */
  // var [projects, setProjects] = useState();
  /**
   * useMutation hook for fetching the projects
   * @type {MutationObserverResult}
   */
  const {
    data: projects,
    isError: errorFetchingProjects,
    isPending: isPendingFetchingProjects,
  } = useQuery({
    queryKey: ['all-projects', id ? id : userInfo?.id],
    queryFn: () => fetchProjectsOfUSer(id ? id : userInfo?.id),
    gcTime: 1000 * 60 * 60 * 24,
    // onSuccess: (data, variables, context) => {
    //   console.log(data, variables, context);
    //   setProjects({ items: data });
    //   queryClient.invalidateQueries({
    //     queryKey: ['all-projects'],
    //   });
    // },
    // onError: (error, variables, context) => {
    //   console.log(error);
    // },
  });

  const {
    data: User,
    isLoading,
    isFetched,
    isError,
    isPending,
  } = useQuery({
    queryKey: ['users', id ? id : userInfo?.id],
    queryFn: () => getUserDetails(id ? id : userInfo?.id),
    // refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 60 * 24 * 7,
  });
  const [status, setStatus] = useState();
  interface LatLng {
    type: string;
    coordinates: number[];
  }
  const [latLng, setLatLng] = useState<LatLng | undefined>();

  const accessToken =
    'pk.eyJ1IjoiZGhpcmFqa2hhbGkiLCJhIjoiY2x5cjV1d2F6MDRpdzJscXgwMjZocG9sOCJ9.hultT77te_oDoBrMjtA6Rw';
  const geocodingCore = useGeocodingCore({
    accessToken: accessToken,
  });
  const reverseGeocoding = async (latitude, longitude) => {
    const response = await geocodingCore.reverse(
      {
        lng: longitude,
        lat: latitude,
      },
      {
        limit: 1,
      },
    );

    if (response.features.length === 0) {
      console.log(response);
    } else {
      const feature = response.features[0];

      form.setValue('address', response.features[0].properties.full_address);
      console.log(response);
    }
  };
  return (
    <>
      {' '}
      <div
        // ref={addProjRef}
        className={`z-10 border-4 fixed  top-[57%] left-[50%] w-[80%]   ${addProjectCardVisible ? 'block' : 'invisible'} bg-primary-foreground p-8 rounded-lg h-[73lvh] animate-fadeIn -translate-x-1/2 overflow-scroll -translate-y-1/2 `}
      >
        <IoCloseCircleOutline
          height={20}
          width={20}
          onClick={() => {
            setAddProjectCardVisible(false);
          }}
          className="absolute right-2 h-6 w-6"
        />
        <h1 className="text-center">Add Project</h1>
        <Form {...form}>
          <form
            encType="multipart/form-data"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Title"
                      {...field}

                      // style={{
                      //   border: 'none',
                      //   outline: 'none',
                      //   borderBottom: '2px solid black',
                      // }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="description"
                      {...field}

                      // style={{
                      //   border: 'none',
                      //   borderBottom: '2px solid black',
                      // }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    {/* <Geocoder
                        placeholder="address"
                        accessToken={accessToken}
                        value={inputValue}
                        onChange={d => {
                          setInputValue(d);
                        }}
                        popoverOptions={{
                          flip: true,
                          placement: 'bottom-start',
                        }}
                        onRetrieve={res => {
                          console.log(res);
                          setGeometry(res.geometry);
                        }}
                      /> */}
                    <div className="flex gap-2 animate-fadeIn flex-col md:flex-row w-full justify-between items-center">
                      <Input
                        type="text"
                        placeholder="address"
                        {...field}
                        className="w-full  col-span-4"
                        disabled

                        // style={{
                        //   border: 'none',
                        //   borderBottom: '2px solid black',
                        // }}
                      />
                      <Button
                        className="p-1 md:p-2 w-full md:w-44"
                        onClick={e => {
                          e.preventDefault();
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              success,
                              error,
                              {
                                enableHighAccuracy: true,
                              },
                            );
                          } else {
                            console.log('Geolocation not supported');
                          }

                          async function success(position) {
                            const latitude = position.coords.latitude;
                            const longitude = position.coords.longitude;
                            // console.log(
                            //   `Latitude: ${latitude}, Longitude: ${longitude}`,
                            // );
                            setLatLng({
                              type: 'Point',
                              coordinates: [longitude, latitude],
                            });
                            console.log(latLng);
                            await reverseGeocoding(latitude, longitude);
                          }

                          function error() {
                            console.log('Unable to retrieve your location');
                          }
                        }}
                      >
                        Fetch address
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                      {...field}

                      // onValueChange={e => setStatus(e)}
                    >
                      <option
                        className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        value="Apartment"
                      >
                        Apartment
                      </option>
                      <option value="Bridge">Bridge</option>
                      <option value="Road">Road</option>
                      <option value="Tower">Tower</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem>
                  <FormLabel>Add More Images?</FormLabel>
                  <FormControl>
                    <Input
                      onChange={e => {
                        if (e.target.files && e.target.files.length > 0) {
                          setUploadImages(e.target.files);
                        }
                      }}
                      type="file"
                      accept="image/*"
                      placeholder="images"
                      multiple
                      // value={file}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button
              type="submit"
              disabled={isUploadPending}
              className="w-full py-2 px-4 bg-popover-foreground text-primary-foreground rounded-lg hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
            >
              {isUploadPending && <LoaderCircleIcon className="animate-spin" />}
              Add Project
            </Button>
          </form>
        </Form>
      </div>
      <div
        className={`${addProjectCardVisible ? 'blur-sm' : ''} mt-[5.25rem] flex flex-col min-h-dvh`}
      >
        <header className="bg-primary-background  py-12 md:py-16 lg:py-20">
          <div className="container flex flex-col items-center text-center gap-4">
            <Avatar className="w-24 h-24 md:w-32 md:h-32">
              <AvatarImage src={User?.dp} />
              <AvatarFallback>{User?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-primary-background md:text-4xl">
                {User?.name}
              </h1>
              <p className="text-muted-foreground md:text-lg">{User?.email}</p>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <section className="container py-10 md:py-11 lg:py-12">
            <div className="grid gap-8">
              <div className="col-span-2 lg:col-span-1">
                <div className="flex flex-row gap-2 justify-between">
                  <h2 className="w-fit text-2xl font-bold">Recent Projects</h2>
                  {userInfo?.id == id && (
                    <Button
                      onClick={() => {
                        setAddProjectCardVisible(true);
                      }}
                    >
                      Add Project
                    </Button>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-6 mt-6">
                  {projects?.map(project => (
                    // <a href={`../projects/${project._id}`}>
                    <Card
                      onClick={() => {
                        navigate(`../../projects/${project._id}`);
                      }}
                      key={project.id}
                    >
                      <CardContent className="pt-3 grid gap-4">
                        <img
                          src={`${project.img.at(0)}`}
                          width={400}
                          height={225}
                          alt={`Project Thumbnail: ${project.title}`}
                          className="rounded-md object-cover aspect-video"
                        />
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">
                            {project.title}
                          </h3>
                          <p className="text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    // </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
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
