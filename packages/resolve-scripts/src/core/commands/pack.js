import fs from 'fs-extra'
import path from 'path'
import archiver from 'archiver'
import { execSync } from 'child_process'
import commands from '../../../configs/command.list.json'

const excludeFiles = [
  '.gitignore',
  '.DS_Store',
  'npm-debug.log',
  'Dokerfile',
  'Jenkinsfile',
  'README.md',
  '.flowconfig',
  '.prettierignore',
  'package-lock.json',
  'yarn.lock'
]

const excludeDirs = [
  '__tests__',
  '__mocks__',
  '.git',
  'tests',
  'test',
  'dist',
  'common',
  'node_modules'
]

const regexp = /.*\.db/

const PKG_DIR = '.package'

const createDeployDir = () => {
  if (fs.existsSync(PKG_DIR)) {
    fs.removeSync(PKG_DIR)
  }
  fs.mkdirSync(PKG_DIR)
}

const copyFolderRecursiveSync = (source, target) => {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target)
  }
  fs.readdirSync(source).forEach(file => {
    if (
      excludeFiles.includes(file) ||
      excludeDirs.includes(file) ||
      file === PKG_DIR ||
      regexp.test(file)
    ) {
      return
    }

    const curSource = path.join(source, file)
    if (fs.lstatSync(curSource).isDirectory()) {
      copyFolderRecursiveSync(curSource, path.join(target, file))
      return
    }
    fs.copyFileSync(curSource, path.join(target, file))
  })
}

const copyDeployFiles = () => {
  const source = path.join(process.cwd())
  const target = path.join(process.cwd(), PKG_DIR)

  copyFolderRecursiveSync(source, target)
}

const zipPackage = () => {
  const output = fs.createWriteStream(
    path.join(process.cwd(), `${PKG_DIR}/${PKG_DIR}.zip`)
  )
  const archive = archiver('zip')

  archive.pipe(output)
  archive.directory(`${PKG_DIR}/`, PKG_DIR)
  archive.finalize()
}

export const handler = () => {
  createDeployDir()
  execSync('yarn resolve-scripts build --cloud')

  copyDeployFiles()
  zipPackage()
}

export const command = 'pack'
export const desc = commands.pack
export const builder = () => {}
