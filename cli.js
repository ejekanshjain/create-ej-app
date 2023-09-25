#!/usr/bin/env node

const { program } = require('commander')
const fs = require('fs')
const path = require('path')
const { prompt } = require('enquirer')
const copydir = require('copy-dir')

program.action(async () => {
  const response = await prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter the project name:',
      initial: 'ej-app'
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
          message: 'Base setup with ts, shadcn, prisma, auth, editor.js'
        },
        {
          name: 'advanced',
          message:
            'Advanced setup with User Types and ACLs (roles & permissions)'
        }
      ]
    }
  ])

  const { projectName, description, template } = response

  // Create a directory with the project name
  const projectDir = path.join(process.cwd(), projectName)

  if (fs.existsSync(projectDir)) {
    console.error(`Error: Directory '${projectName}' already exists.`)
    process.exit(1)
  }

  fs.mkdirSync(projectDir)

  // Copy all files and subdirectories from your template folder to the new project directory
  const templateDir = path.join(__dirname, 'template', template)
  copydir.sync(templateDir, projectDir)

  // Modify package.json in the new project directory to set the project name and description
  const packageJsonFile = path.join(projectDir, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonFile, 'utf-8'))
  packageJson.name = projectName
  packageJson.description = description
  fs.writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2))

  // Modify src/lib/siteConfig.ts in the new project directory to set the project name and description
  const siteConfigFile = path.join(projectDir, 'src', 'lib', 'siteConfig.ts')
  let siteConfig = fs.readFileSync(siteConfigFile, 'utf-8')
  siteConfig = siteConfig.replace('Project Name', projectName)
  siteConfig = siteConfig.replace('Project Description', description)
  fs.writeFileSync(siteConfigFile, siteConfig)

  // Copy .env.example to .env
  const envExampleFile = path.join(projectDir, '.env.example')
  const envExample = fs.readFileSync(envExampleFile, 'utf-8')
  fs.writeFileSync(path.join(projectDir, '.env'), envExample)

  console.log(`Created a new app called '${projectName}' 🎉


To get started, run the following commands:

cd ${projectName}

npm install

npm run dev
`)
})

program.parse(process.argv)
