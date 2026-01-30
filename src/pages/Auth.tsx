import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ArrowLeft, Mail } from 'lucide-react';

type Step = 'email' | 'otp';

export default function Auth() {
  const { user, sendOtp, verifyOtp, loading } = useAuth();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Sila masukkan alamat e-mel');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await sendOtp(email);
      if (error) {
        if (error.message.includes('rate limit')) {
          toast.error('Terlalu banyak percubaan. Sila tunggu beberapa minit.');
        } else {
          toast.error('Gagal menghantar kod: ' + error.message);
        }
      } else {
        toast.success('Kod OTP telah dihantar ke e-mel anda');
        setStep('otp');
        setCountdown(60);
      }
    } catch (error) {
      toast.error('Ralat tidak dijangka berlaku');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Sila masukkan kod 6 digit');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await verifyOtp(email, otp);
      if (error) {
        if (error.message.includes('expired')) {
          toast.error('Kod telah tamat tempoh. Sila minta kod baru.');
        } else if (error.message.includes('invalid')) {
          toast.error('Kod tidak sah. Sila cuba lagi.');
        } else {
          toast.error('Gagal mengesahkan kod: ' + error.message);
        }
      } else {
        toast.success('Berjaya log masuk!');
      }
    } catch (error) {
      toast.error('Ralat tidak dijangka berlaku');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    try {
      const { error } = await sendOtp(email);
      if (error) {
        toast.error('Gagal menghantar kod: ' + error.message);
      } else {
        toast.success('Kod baru telah dihantar');
        setCountdown(60);
        setOtp('');
      }
    } catch (error) {
      toast.error('Ralat tidak dijangka berlaku');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('email');
    setOtp('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Memuatkan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sistem Pengurusan Petty Cash</CardTitle>
          <CardDescription>
            {step === 'email' 
              ? 'Masukkan e-mel untuk menerima kod pengesahan' 
              : `Kod telah dihantar ke ${email}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mel</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@contoh.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Menghantar...' : 'Hantar Kod OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="mb-2 -ml-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Tukar e-mel
              </Button>
              
              <div className="space-y-4">
                <Label className="block text-center">Masukkan Kod Pengesahan</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                {isLoading ? 'Mengesahkan...' : 'Sahkan'}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isLoading}
                  className="text-sm"
                >
                  {countdown > 0 
                    ? `Hantar semula kod (${countdown}s)` 
                    : 'Hantar semula kod'
                  }
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
