import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full h-[60px] bg-white border-b border-slate-200 flex items-center justify-center px-4 md:px-6">
      <div className="w-full max-w-[1200px] flex items-center">
        <Link href="/" className="inline-flex items-center">
          {/* 모바일용 작은 로고 */}
          <img
            src="/images/logo-small.svg"
            alt="do it 로고"
            className="block sm:hidden h-10 w-auto"
          />
          {/* 태블릿/데스크탑용 큰 로고 */}
          <img
            src="/images/logo-large.svg"
            alt="do it 로고"
            className="hidden sm:block h-10 w-auto"
          />
        </Link>
      </div>
    </header>
  );
}
