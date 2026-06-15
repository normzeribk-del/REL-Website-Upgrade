import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index:          resolve(__dirname, 'index.html'),
        about:          resolve(__dirname, 'about.html'),
        services:       resolve(__dirname, 'services.html'),
        projects:       resolve(__dirname, 'projects.html'),
        gallery:        resolve(__dirname, 'gallery.html'),
        team:           resolve(__dirname, 'team.html'),
        contact:        resolve(__dirname, 'contact.html'),
        'project-detail': resolve(__dirname, 'project-detail.html'),
      }
    }
  }
})
