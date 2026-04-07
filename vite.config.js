import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        lecture1: resolve(__dirname, 'Lecture_1_Fundamental_Measurement.html'),
        lecture2: resolve(__dirname, 'Lecture_2_From_Data_to_Measurement.html'),
        presenter: resolve(__dirname, 'src/presenter.html'),
      },
    },
  },
})
