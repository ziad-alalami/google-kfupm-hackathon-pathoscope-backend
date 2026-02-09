This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.


## THE IMPORTANT STEP TO MAKE THE MAP RENDER 
The app requires a Mapbox API token. Sign up [here](https://www.mapbox.com/) and save the public token as **NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN** in your .env file in the ``/frontend`` directory. For any env token, prefix it with **NEXT_PUBLIC** to be able to use it.

## Project Breakdown

- ``/app/page.tsx``: the file that is rendered on the screen. This is the "main" file of the project (other files are stylistic)
- ``/components``: the directory that contains all the components of the site
- ``lib/api.ts``: the file that defines the connections between the frontend and the backend