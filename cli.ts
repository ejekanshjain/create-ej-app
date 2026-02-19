#!/usr/bin/env node

import { execSync } from 'child_process'
import { program } from 'commander'
import { prompt } from 'enquirer'
import fs from 'fs'
import path from 'path'
//@ts-ignore
import copydir from 'copy-dir'

interface Response {
  projectName: string
  description: string
  template: string
  git: string
}

const detectPackageManager = () => {
  const userAgent = process.env.npm_config_user_agent

  if (userAgent) {
    if (userAgent.startsWith('pnpm')) return 'pnpm'
    if (userAgent.startsWith('yarn')) return 'yarn'
    if (userAgent.startsWith('bun')) return 'bun'
  }

  return 'npm'
}

const getInstallCommand = (packageManager: string) => {
  switch (packageManager) {
    case 'pnpm':
      return 'pnpm i'
    case 'yarn':
      return 'yarn'
    case 'bun':
      return 'bun i'
    default:
      return 'npm i'
  }
}

const getDevCommand = (packageManager: string) => {
  switch (packageManager) {
    case 'pnpm':
      return 'pnpm dev'
    case 'yarn':
      return 'yarn dev'
    case 'bun':
      return 'bun dev'
    default:
      return 'npm run dev'
  }
}

program.action(async () => {
  const response: Response = await prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter the project name:',
      initial: 'my-project'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Enter a description for the project:',
      initial: 'A Legendary Project'
    },
    {
      type: 'select',
      name: 'template',
      message: 'Select a template:',
      choices: [
        {
          name: 'nextjs',
          message:
            'Full Stack setup with Next 16, Better Auth, shadcn and Drizzle'
        },
        {
          name: 'api',
          message: 'API Server setup with Elysia, Drizzle, Typescript'
        }
      ]
    },
    {
      type: 'select',
      name: 'git',
      message: 'Initialize a git repository?',
      choices: ['yes', 'no']
    }
  ])

  const { projectName, description, template, git } = response

  const projectDir = path.join(process.cwd(), projectName)

  if (fs.existsSync(projectDir)) {
    console.error(`Error: Directory '${projectName}' already exists.`)
    process.exit(1)
  }

  fs.mkdirSync(projectDir)

  const templateDir = path.join(__dirname, 'template', template)
  copydir.sync(templateDir, projectDir)

  const packageJsonFile = path.join(projectDir, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonFile, 'utf-8'))
  packageJson.name = projectName
  packageJson.description = description
  fs.writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2))

  const envExampleFile = path.join(projectDir, '.env.example')
  const envExample = fs.readFileSync(envExampleFile, 'utf-8')
  fs.writeFileSync(path.join(projectDir, '.env'), envExample)

  if (template === 'nextjs') {
    const siteConfigFile = path.join(projectDir, 'src', 'lib', 'siteConfig.ts')
    let siteConfig = fs.readFileSync(siteConfigFile, 'utf-8')
    siteConfig = siteConfig.replace('Project Name', projectName)
    siteConfig = siteConfig.replace('Project Description', description)
    fs.writeFileSync(siteConfigFile, siteConfig)

    fs.writeFileSync(
      path.join(projectDir, '.gitignore'),
      `node_modules
  .next
  out
  build
  next-env.d.ts
  .DS_Store
  .env
`
    )

    fs.writeFileSync(
      path.join(projectDir, 'terraform', '.gitignore'),
      `.terraform
  *.tfstate
  *.tfstate.*
  .terraform.lock.hcl
`
    )
  }

  if (template === 'api') {
    fs.writeFileSync(
      path.join(projectDir, '.gitignore'),
      `node_modules
.DS_Store
.env
server
`
    )
  }

  fs.writeFileSync(
    path.join(projectDir, 'README.md'),
    `# ${projectName}

${description}
`
  )

  if (git === 'yes') {
    try {
      execSync('git init', { cwd: projectDir, stdio: 'inherit' })
    } catch (err) {
      console.error('Error initializing git repository:', err)
    }
  }

  const pm = detectPackageManager()
  const installCommand = getInstallCommand(pm)
  const devCommand = getDevCommand(pm)

  console.log(
    `
Created a new app called '${projectName}' 🎉

To open the project in vscode run:

code ${projectName}


To get started, run the following commands:
cd ${projectName}

${installCommand}

${devCommand}

Happy coding! 🚀
`
  )
})

program.parse(process.argv)
