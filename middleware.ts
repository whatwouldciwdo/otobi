import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware — proteksi route /admin
 * Redirect ke /auth/login jika cookie sesi tidak ada.
 * Cookie "otobi-user" di-set oleh client setelah login berhasil.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Hanya lindungi halaman admin (bukan API)
  if (pathname.startsWith("/admin")) {
    const userCookie = request.cookies.get("otobi-user");

    if (!userCookie?.value) {
      const loginUrl = new URL("/auth/login", request.url);
      // Simpan halaman yang dituju agar bisa redirect kembali setelah login
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Validasi isi cookie — harus ada role ADMIN
    try {
      const user = JSON.parse(decodeURIComponent(userCookie.value));
      if (user?.role !== "ADMIN") {
        // User login tapi bukan admin — redirect ke halaman utama
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      // Cookie corrupt — hapus dan redirect ke login
      const response = NextResponse.redirect(new URL("/auth/login", request.url));
      response.cookies.delete("otobi-user");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  // Jalankan middleware hanya untuk halaman admin (bukan file statis / API)
  matcher: ["/admin/:path*"],
};
