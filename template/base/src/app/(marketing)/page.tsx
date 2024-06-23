import Image from 'next/image'

const links = [
  {
    href: 'https://nextjs.org',
    title: 'Next.js',
    description: 'Find in-depth information about Next.js features and API.'
  },
  {
    href: 'https://typescriptlang.org',
    title: 'TypeScript',
    description:
      'Learn about TypeScript and how it helps you write better JavaScript.'
  },
  {
    href: 'https://orm.drizzle.team',
    title: 'Drizzle',
    description:
      'Lightweight and performant TypeScript ORM with developer experience in mind.'
  },
  {
    href: 'https://next-auth.js.org',
    title: 'NextAuth.js',
    description:
      'Authentication for Next.js featuring sign in with GitHub and more.'
  },
  {
    href: 'https://tailwindcss.com',
    title: 'Tailwind CSS',
    description:
      'A utility-first CSS framework for rapidly building custom designs.'
  },
  {
    href: 'https://shadcn.com',
    title: 'Shadcn UI',
    description: 'An awesome ui component library with tailwindcss.'
  },
  {
    href: 'https://nextjs.org/docs/app/api-reference/functions/server-actions',
    title: 'Server Actions',
    description: 'Learn about Server Actions and how to use them.'
  },
  {
    href: 'https://vercel.com/new',
    title: 'Vercel',
    description:
      'Instantly deploy your Next.js site to a shareable URL with Vercel.'
  }
]

const Home = () => {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-between">
      <div className="w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">src/app/page.tsx</code>
        </p>
      </div>

      <div className="before:bg-gradient-radial after:bg-gradient-conic z-[-1] mt-12 flex place-items-center before:absolute before:h-[300px] before:w-[240px] before:-translate-x-1/2 before:rounded-full before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[120px] after:translate-x-1/3 after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
        <Image
          className="dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div className="my-8 grid gap-2 text-center lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
        {links.map((l, i) => (
          <a
            key={i}
            href={l.href}
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className="mb-3 text-2xl font-semibold">
              {l.title + ' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              {l.description}
            </p>
          </a>
        ))}
      </div>
    </div>
  )
}

export default Home
