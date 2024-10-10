// @ts-nocheck
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import apiRequest from '../../lib/apiRequest';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '@/components/ui/use-toast';
import { login } from '../../features/authenticate/authenticateSlice';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import './login.scss';
import Cookies from 'js-cookie';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';

const formSchema = z
  .object({
    email: z.string().email('This is not a valid email.'),
    password: z.string().min(8, {
      message: 'Password must be at least 8 characters.',
    }),
  })
  .refine(data => data.email && data.password, {
    message: 'Please fill in all fields.',
    path: ['email', 'password'],
  });

export default function Login() {
  const { userInfo } = useSelector((state: any) => state.authenticate);
  console.log('accessToken', userInfo);
  const navigate = useNavigate();
  useEffect(() => {
    // redirect user to login page if registration was successful
    if (userInfo) navigate('/home');

    // redirect authenticated user to profile screen
  }, [userInfo]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const { toast } = useToast();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState(null);
  const { handleSubmit, formState, control } = form;
  const { isSubmitting } = formState;
  const dispatch = useDispatch();
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      setError(null);
      console.log(values.email.toLowerCase());

      const res = await apiRequest.post('/users/login', {
        email: values.email.toLowerCase(),
        password: values.password,
      });

      if (res.status == 200) {
        Cookies.set('userData', JSON.stringify(res.data), {
          path: 'localhost:5173',
          sameSite: 'lax',
          secure: false,
        });
        console.log(res.data);
        setSuccess(true);
        toast({
          title: 'Success ✅',
          description: 'Logged in successfully',
          variant: 'default',
        });
        dispatch(login(res.data));
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        // Redirect to dashboard or home page
        navigate('/home');
      } else {
        setError(res.data.message);
        toast({
          title: 'Error ❌',
          description: res.data.message,
          variant: 'destructive',
          onDoubleClickCapture: () => {
            console.log('double click');
          },
          duration: 3000,
        });
      }
      setLoading(false);
    } catch (err: any) {
      // setError(err.response.data.message);
      setLoading(false);
      toast({
        title: 'Error ❌',
        description: err.response.data.message,
        variant: 'destructive',
        onDoubleClickCapture: () => {
          console.log('double click');
        },
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex items-center justify-center h-[100vh] content-center md:my-12  bg-custom-gradient">
      <div className="w-full max-w-4xl flex  md:rounded-lg md:shadow-md overflow-hidden md:border-[#0f172a] md:border-4 mx-1">
        <div
          className="w-3/5 bg-cover bg-center hidden sm:block "
          style={{ backgroundImage: 'url("/alo2.jpg")' }}
        ></div>
        <div className="w-full p-8 md:w-2/5">
          <h2 className="text-2xl font-extrabold font-poppins text-center text-foreground mb-8">
            Login
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        className="text-sm  w-full py-2 px-3 border-b-2  rounded-none border-b-muted-foreground focus-visible::marker:bg-red-500 bg-muted"
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
                        id="password"
                        type="password"
                        placeholder="Password"
                        {...field}
                        className="text-sm  w-full py-2 px-3 border-b-2  rounded-none border-b-muted-foreground focus-visible::marker:bg-red-500 bg-muted"
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
              {error && <div className="text-destructive text-sm">{error}</div>}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 "
              >
                {loading ? 'Loading...' : 'Login'}
              </Button>
              <p className="mt-4 text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
