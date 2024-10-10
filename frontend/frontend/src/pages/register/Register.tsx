'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import apiRequest from '../../lib/apiRequest';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import './register.scss';
import Cookies from 'js-cookie';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
// import Navbar from '../../components/navbar/Navbar';

let defaultDpFile: File;
/**
 * Retrieves a Blob object from the specified URL and calls the provided
 * callback function with the Blob object.
 *
 * @param {string} url - The URL of the file to retrieve.
 * @param {function} convertBlob - The callback function to call with the Blob object.
 */
export function GetFileBlobUsingURL(
  url: string,
  convertBlob: (blob: Blob) => void,
): void {
  // Create a new XMLHttpRequest object
  const xhr = new XMLHttpRequest();

  // Open a GET request to the specified URL
  xhr.open('GET', url);

  // Set the response type to blob
  xhr.responseType = 'blob';

  // Add a listener for the load event
  xhr.addEventListener('load', () => {
    // Call the callback function with the response Blob object
    convertBlob(xhr.response);
  });

  // Send the request
  xhr.send();
}

/**
 * Converts a Blob object to a File object with the specified name.
 *
 * @param {Blob} blob - The Blob object to convert.
 * @param {string} name - The name of the resulting File object.
 * @return {File} The resulting File object.
 */
function blobToFile(blob: Blob, name: string): File {
  // Create a new File object with the provided Blob object, name, and metadata
  const file: File = new File([blob], name, {
    type: blob.type,
    lastModified: Date.now(),
  });

  // Return the resulting File object
  return file;
}

/**
 * Retrieves a File object from the specified URL and calls the provided
 * callback function with the File object.
 *
 * @param {string} filePathOrUrl - The URL or file path of the file to retrieve.
 * @param {function} convertBlob - The callback function to call with the File object.
 */
export function GetFileObjectFromURL(
  filePathOrUrl: string,
  convertBlob: (file: File) => void,
): void {
  // Retrieve the Blob object from the specified URL
  GetFileBlobUsingURL(filePathOrUrl, (blob: Blob) => {
    // Convert the Blob object to a File object with the name 'user.png'
    const file = blobToFile(blob, 'user.png');

    // Call the callback function with the resulting File object
    convertBlob(file);
  });
}

/**
 * The form schema that defines the shape of the form data.
 */
const formSchema = z
  .object({
    name: z.string().min(2, {
      message: 'Username must be at least 2 characters.',
    }),
    email: z.string().email('This is not a valid email.'),
    password: z
      .string()
      .min(8, {
        message: 'Password must be at least 8 characters.',
      })
      .max(14, 'Password must be at most 14 characters'),
    confirmPassword: z
      .string()
      .min(8, {
        message: 'Password must be at least 8 characters.',
      })
      .max(14, 'Password must be at most 14 characters'),
    file: z.instanceof(FileList).optional(),
  })
  .superRefine(({ confirmPassword, password }, ctx: z.RefinementCtx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        path: ['confirmPassword'],
      });
    }
  });

/**
 * The Register component that renders the registration form.
 * @returns {JSX.Element} The rendered registration form.
 */
export default function Register() {
  const { userInfo } = useSelector((state: any) => state.authenticate);
  console.log('accessToken', userInfo);
  const navigate = useNavigate();
  useEffect(() => {
    // redirect user to login page if registration was successful
    if (userInfo) navigate('/home');

    // redirect authenticated user to profile screen
  }, [userInfo]);
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Retrieve the File object from the specified URL and set it as the defaultDpFile variable
  const FileURL: string = '/user.png';
  GetFileObjectFromURL(FileURL, (fileObject: File) => {
    defaultDpFile = fileObject;
    // console.log('hi', fileObject);
  });

  // toast is a function provided by the useToast hook.
  // It is used to display toast messages to the user.
  // The toast function takes an object as its argument,
  // which contains the properties of the toast message.
  // The properties include the message to be displayed,
  // the variant of the toast (e.g., success, error),
  // and the duration the toast should be displayed.
  // In this case, we are importing the toast function from the useToast hook.
  // This allows us to display toast messages in this component.
  /**
   * A function to display toast messages.
   * @param {Object} options - The options for the toast message.
   * @param {string} options.message - The message to be displayed in the toast.
   * @param {string} [options.variant='default'] - The variant of the toast.
   * @param {number} [options.duration=5000] - The duration in milliseconds the toast should be displayed.
   */
  const { toast } = useToast();
  // State to store the selected file
  const [file, setFile] = useState('');
  const [img, setImg] = useState({ image: '/user.png' });
  // console.log(URL.createObjectURL(defaultDpFile));
  // setFile(URL.createObjectURL(defaultDpFile));
  // console.log('defaultImageLocation', img);
  // console.log('default', file);

  /**
   * Function to handle file selection.
   * @param {Event} e - The event object.
   */
  const saveFile = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      // console.log(e.target.files[0]);
      setFile(e.target.files[0]);
      // console.log(defaultDpFile.name)
      // console.log("chosen file",file.name)
      setImg({ image: URL.createObjectURL(e.target.files[0]) });
    }
    // setImg(URL.createObjectURL(e.target.files[0]));
    // console.log(img);
  };

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // @ts-ignore
  const [success, setSuccess] = useState(false);
  const { formState } = form;
  const { isSubmitting } = formState;
  /**
   * Function to handle form submission.
   * @param {z.infer<typeof formSchema>} values - The form values.
   */
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    try {
      const formData = new FormData();

      formData.append('dp', file !== '' ? file : defaultDpFile);
      formData.append('name', values.name);
      formData.append('password', values.password);
      formData.append('role', 'USER');
      formData.append('email', values.email);
      setLoading(true);
      setError(null);
      const res = await apiRequest.post('/users/register', formData);
      if (res.status === 201) {
        Cookies.set('userData', JSON.stringify(res.data), {
          path: 'localhost:5173',
          sameSite: 'lax',
          secure: false,
        });
        setSuccess(true);
        toast({
          title: 'Success ✅',
          description: 'Account created successfully',
          variant: 'default',
        });
        setLoading(false);

        navigate('/login');
      } else {
        // setError(res.data.message);
      }
      setLoading(false);
    } catch (err: any) {
      const errorMessage = err.response.data.message;
      console.log(errorMessage);
      // setError(errorMessage);
      setLoading(false);
      toast({
        title: 'Error while creating Account',
        description: err.response.data.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className=" flex items-center justify-center h-[100vh]  md:my-12 content-center  bg-custom-gradient">
      <div className="w-full max-w-4xl flex  md:rounded-lg md:shadow-md overflow-hidden md:border-[#0f172a] md:border-4 mx-1">
        <div
          className=" w-3/5 bg-cover bg-center hidden sm:block "
          style={{ backgroundImage: 'url("/alo2.jpg")' }}
        ></div>
        <div className="w-full p-8 md:w-2/5">
          <h2 className="text-2xl font-extrabold font-poppins text-center text-foreground mb-8">
            Register
          </h2>
          <Form {...form}>
            <form
              encType="multipart/form-data"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="file"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <div className=" flex items-center justify-center mb-6">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={saveFile}
                            placeholder="shadcn"
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                            // value={file}
                          />
                          <div
                            className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer border-2 border-black"
                            style={{
                              backgroundImage: `url(${img.image})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          >
                            <span className="text-2xl text-gray-700">+</span>
                          </div>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Name"
                        {...field}
                        className=" text-sm  w-full py-2 px-3 border-b-2  rounded-none border-b-muted-foreground"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email"
                        {...field}
                        className="text-sm  w-full py-2 px-3 border-b-2  rounded-none border-b-muted-foreground"
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Password"
                        {...field}
                        className="text-sm  w-full py-2 px-3 border-b-2  rounded-none border-b-muted-foreground"
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
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm Password"
                        {...field}
                        className="text-sm  w-full py-2 px-3 border-b-2  rounded-none border-b-muted-foreground"
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
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 bg-popover-foreground text-primary-foreground rounded-lg hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
              >
                {loading ? 'Loading...' : 'Register'}
              </Button>
              <p className="mt-4 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
