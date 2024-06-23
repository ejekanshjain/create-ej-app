#!/usr/bin/env node

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
}

program.action(async () => {
  const response: Response = await prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter the project name:',
      initial: 'my-app'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Enter a description for the project:',
      initial: 'A Legendary App'
    },
    {
      type: 'select',
      name: 'template',
      message: 'Select a template:',
      choices: [
        {
          name: 'base',
          message:
            'Base setup with ts, shadcn, auth, drizzle, User Types and ACLs (roles & permissions)'
        },
        {
          name: 'prisma',
          message: 'Base setup with ts, shadcn, prisma, auth, editor.js'
        },
        {
          name: 'prisma-advanced',
          message:
            'Advanced setup with User Types and ACLs (roles & permissions)'
        }
      ]
    }
  ])

  const { projectName, description, template } = response

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

  const siteConfigFile = path.join(projectDir, 'src', 'lib', 'siteConfig.ts')
  let siteConfig = fs.readFileSync(siteConfigFile, 'utf-8')
  siteConfig = siteConfig.replace('Project Name', projectName)
  siteConfig = siteConfig.replace('Project Description', description)
  fs.writeFileSync(siteConfigFile, siteConfig)

  const envExampleFile = path.join(projectDir, '.env.example')
  const envExample = fs.readFileSync(envExampleFile, 'utf-8')
  fs.writeFileSync(path.join(projectDir, '.env'), envExample)

  console.log(
    `Created a new app called '${projectName}' 🎉\n\nTo get started, run the following commands:\n\ncd ${projectName}\nnpm install\nnpm run dev\n`
  )
})

program.parse(process.argv)
