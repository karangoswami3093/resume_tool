import Link from "next/link";
import { Zap } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0D3B2C] flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-[#1E5C40] flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white">Resumint</span>
      </Link>
      <div className="w-full max-w-md bg-[#0D3B2C] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
        <h1 className="text-xl font-bold text-white mb-2">Auth disabled for testing</h1>
        <p className="text-white/50 text-sm mb-6">Go directly to the builder to test the app.</p>
        <Link
          href="/builder"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C8E83C] hover:bg-[#d4ef55] text-[#0D3B2C] font-semibold rounded-xl transition-colors"
        >
          Open Builder →
        </Link>
      </div>
    </div>
  );
}
