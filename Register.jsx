import React, { useState } from "react";
import { Link } from "react-router-dom";
import { vscode} from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User as UserIcon, IdCard, Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import Seal from "@/components/Seal";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";

const NAVY = "#0a192f";
const HEADING = "#2d3748";

function SectionHeader({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <Icon className="w-4 h-4" style={{ color: HEADING }} aria-hidden="true" />
      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: HEADING }}>
        {label}
      </p>
    </div>
  );
}

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }
    setLoading(true);
    try {
      await vscode.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await vscode.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        vscode.auth.setToken(result.access_token);
      }
      // Best-effort: save the profile details on the user record.
      try {
        await base44.auth.updateMe({
          full_name: fullName,
          birth_date: birthDate,
          gender,
          mobile_number: mobile,
          home_address: address,
        });
      } catch {
        /* profile enrichment is optional — continue to the app */
      }
      window.location.href = safeReturnTo();
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await vscode.auth.resendOtp(email);
      toast({
        title: "Code sent",
        description: "Check your email for the new code.",
      });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  const handleGoogle = () => {
    vscode.auth.loginWithProvider("google", safeReturnTo());
  };

  const returnTo = safeReturnTo();

  if (showOtp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-blue-100/70 p-8">
          <div className="text-center mb-6">
            <Seal className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900">Barangay Management System</h1>
            <p className="text-lg font-bold mt-3" style={{ color: HEADING }}>Verify your email</p>
            <p className="text-sm text-gray-500 mt-1">We sent a code to {email}</p>
          </div>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
              {error}
            </div>
          )}
          <div className="flex justify-center mb-6">
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={setOtpCode}
              autoFocus
              autoComplete="one-time-code"
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
          <Button
            className="w-full h-11 font-medium text-white"
            style={{ backgroundColor: NAVY }}
            onClick={handleVerify}
            disabled={loading || otpCode.length < 6}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>
          <p className="text-center text-sm text-gray-500 mt-4">
            Didn't receive the code?{" "}
            <button onClick={handleResend} className="font-medium hover:underline" style={{ color: NAVY }}>
              Resend
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-blue-100/70 p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <Seal className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-lg font-bold text-gray-900">Barangay Management System</h1>
          <p className="text-2xl font-bold mt-2" style={{ color: HEADING }}>Create Your Account</p>
          <p className="text-sm text-gray-500 mt-1">Register to access institutional services and records.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <SectionHeader icon={UserIcon} label="Personal Information" />
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-sm" style={{ color: HEADING }}>Full Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-11"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="birthDate" className="text-sm" style={{ color: HEADING }}>Date of Birth</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm" style={{ color: HEADING }}>Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact & Address */}
          <SectionHeader icon={IdCard} label="Contact & Address" />
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm" style={{ color: HEADING }}>Email Address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="john.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mobile" className="text-sm" style={{ color: HEADING }}>Mobile Number</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="+63 9XX XXX XXXX"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-sm" style={{ color: HEADING }}>Complete Home Address</Label>
            <Textarea
              id="address"
              placeholder="123 Main St, Apt 4B, City, State, ZIP"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
            />
          </div>

          {/* Security */}
          <SectionHeader icon={Shield} label="Security" />
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm" style={{ color: HEADING }}>Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-sm" style={{ color: HEADING }}>Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2 cursor-pointer pt-1">
            <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(!!v)} className="mt-0.5" />
            <span className="text-sm text-gray-700">
              I agree to the <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>.
            </span>
          </label>

          {/* Sign Up */}
          <Button
            type="submit"
            className="w-full h-11 font-medium text-white tracking-wide"
            style={{ backgroundColor: NAVY }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              "SIGN UP"
            )}
          </Button>
        </form>

        {/* Google */}
        <Button variant="outline" className="w-full h-11 text-sm font-medium mt-4" onClick={handleGoogle}>
          <GoogleIcon className="w-5 h-5 mr-2" />
          Continue with Google
        </Button>

        {/* Sign In */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to={"/login" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
            className="font-bold hover:underline"
            style={{ color: NAVY }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
