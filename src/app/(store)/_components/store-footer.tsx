import Link from "next/link"
import { Logo } from "@/components/logo"
import { SITE_URL } from "@/utils/constants"

export function StoreFooter() {
  // TODO: add policy
  return (
    <footer className="mb-6 mt-12 w-full px-4 md:px-10">
      <div className="sm:flex sm:items-center sm:justify-between">
        <Logo />
        <ul className="mb-6 mt-4 flex flex-wrap items-center text-sm font-medium text-muted-foreground sm:mb-0 sm:mt-0">
          <li>
            <Link href="/about" className="me-4 hover:underline md:me-6">
              About
            </Link>
          </li>
          <li>
            <Link
              href="/privacy-policy"
              className="me-4 hover:underline md:me-6"
            >
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link href="/licensing" className="me-4 hover:underline md:me-6">
              Licensing
            </Link>
          </li>
          <li>
            <Link href="/contact" className="me-4 hover:underline md:me-6">
              Contact
            </Link>
          </li>
        </ul>
      </div>
      <hr className="my-6 h-px w-full bg-border" />
      <span className="block text-sm text-muted-foreground sm:text-center">
        © {new Date().getFullYear()}{" "}
        <a href={SITE_URL} className="hover:underline">
          Back Up
        </a>
        . All Rights Reserved.
      </span>
    </footer>
  )
}
