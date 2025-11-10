import { NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api/error-handler'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILES_USER = 3

export async function POST(req: Request) {
   try {
      const formData = await req.formData()
      const files = formData.getAll('files') as File[]
      const isAdmin = formData.get('isAdmin') === 'true'

      if (!files || files.length === 0) {
         return NextResponse.json(
            { error: 'No files provided' },
            { status: 400 }
         )
      }

      // Validate file count
      if (!isAdmin && files.length > MAX_FILES_USER) {
         return NextResponse.json(
            { error: `Maximum ${MAX_FILES_USER} files allowed` },
            { status: 400 }
         )
      }

      const uploadedUrls: string[] = []
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

      if (!cloudName) {
         throw new Error('Cloudinary cloud name not configured')
      }

      for (const file of files) {
         // Validate file type
         if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
               { error: `Invalid file type: ${file.type}. Allowed: JPG, PNG, WEBP` },
               { status: 400 }
            )
         }

         // Validate file size
         if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
               { error: `File too large. Maximum size: 10MB` },
               { status: 400 }
            )
         }

         // Validate file name (prevent path traversal)
         const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '')
         if (fileName.length === 0) {
            return NextResponse.json(
               { error: 'Invalid file name' },
               { status: 400 }
            )
         }

         // Convert file to base64
         const bytes = await file.arrayBuffer()
         const buffer = Buffer.from(bytes)
         const base64 = buffer.toString('base64')
         const dataURI = `data:${file.type};base64,${base64}`

         // Upload to Cloudinary using existing preset
         const uploadData = new FormData()
         uploadData.append('file', dataURI)
         uploadData.append('upload_preset', 'plottdesign')
         uploadData.append('folder', isAdmin ? 'products' : 'customizations')

         const cloudinaryResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
               method: 'POST',
               body: uploadData,
            }
         )

         const data = await cloudinaryResponse.json()

         if (!cloudinaryResponse.ok) {
            console.error('Cloudinary error:', data)
            throw new Error(data.error?.message || 'Upload failed')
         }

         uploadedUrls.push(data.secure_url)
      }

      return NextResponse.json({
         urls: uploadedUrls,
         count: uploadedUrls.length,
      })
   } catch (error) {
      console.error('Error uploading files:', error)
      return NextResponse.json(
         { error: error instanceof Error ? error.message : 'Upload failed' },
         { status: 500 }
      )
   }
}
