# Bundee Web Driver Portal

```markdown
## Getting Started

Install all the dependent lib by giving :
```bash
npm install
``` 
Note :  All the environment-specific configurations will be loaded up accordingly. 

First, run the development server in local machine, you can use the following commands:

```bash
npm run dev   // for dev 
npm run qa    // for QA
npm run prod  // for production
```

To run the build server with environment-specific configurations, you can use the following commands:

```bash
# Development environment
npm run build:dev

# Build for QA environment
npm run build:qa

# Build for production environment
npm run build:prod
```


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
Make sure to replace `bun` with the actual command you use for your project.
