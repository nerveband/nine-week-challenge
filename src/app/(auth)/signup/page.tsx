'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { signupSchema, type SignupInput } from '@/lib/validations'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const supabase = createClientComponentClient<Database>()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  })

  const password = watch('password')
  const passwordRequirements = [
    { met: password?.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(password || ''), text: 'One uppercase letter' },
    { met: /[a-z]/.test(password || ''), text: 'One lowercase letter' },
    { met: /[0-9]/.test(password || ''), text: 'One number' },
  ]

  const onSubmit = async (data: SignupInput) => {
    if (!acceptTerms) {
      toast({
        title: 'Please accept the terms',
        description: 'You must accept the terms and conditions to continue.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      })

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
      } else if (authData.user) {
        if (authData.user.email_confirmed_at) {
          toast({
            title: 'Success',
            description: 'Welcome to Nine Week Challenge!',
          })
          window.location.href = '/dashboard'
        } else {
          toast({
            title: 'Success',
            description: 'Welcome to Nine Week Challenge! Please check your email to verify your account.',
          })
          window.location.href = '/login'
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-semibold text-gray-900">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Start your 9-week transformation journey today
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Full name
            </Label>
            <Input
              id="name"
              type="text"
              inputMode="text"
              autoComplete="name"
              placeholder="Jane Doe"
              {...register('name')}
              disabled={isLoading}
              className="mt-1 h-12 text-base"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email')}
              disabled={isLoading}
              className="mt-1 h-12 text-base"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('password')}
                disabled={isLoading}
                className="h-12 text-base pr-12"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : 'password-requirements'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.password.message}
              </p>
            )}
            {password && (
              <div id="password-requirements" className="mt-2 space-y-1">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center text-xs">
                    <CheckCircle2 
                      className={`h-3 w-3 mr-1 ${req.met ? 'text-green-500' : 'text-gray-300'}`}
                    />
                    <span className={req.met ? 'text-green-700' : 'text-gray-500'}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm password
            </Label>
            <div className="relative mt-1">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('confirmPassword')}
                disabled={isLoading}
                className="h-12 text-base pr-12"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="confirm-password-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            className="mt-1"
          />
          <label 
            htmlFor="terms" 
            className="text-sm text-gray-600 cursor-pointer select-none"
          >
            I agree to the{' '}
            <Link href="/terms" className="text-brand-pink hover:text-brand-pink/80 underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-brand-pink hover:text-brand-pink/80 underline">
              Privacy Policy
            </Link>
          </label>
        </div>
        
        <Button
          type="submit"
          variant="brand"
          className="w-full h-12 text-base font-medium"
          disabled={isLoading || !acceptTerms}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
        
        {/* Benefits list */}
        <div className="space-y-2 pt-2">
          <p className="text-xs text-gray-600 font-medium">You&apos;ll get:</p>
          <ul className="space-y-1 text-xs text-gray-600">
            <li className="flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-2 text-brand-mint" />
              Free 9-week program access
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-2 text-brand-mint" />
              Daily habit tracking
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-2 text-brand-mint" />
              Progress visualization
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-2 text-brand-mint" />
              Offline access on mobile
            </li>
          </ul>
        </div>
      </form>
      
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-brand-pink hover:text-brand-pink/80 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}