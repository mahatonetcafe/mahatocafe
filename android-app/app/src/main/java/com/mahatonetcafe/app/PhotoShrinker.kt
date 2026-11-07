package com.mahatonetcafe.app

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.media.ExifInterface
import java.io.File

/** Resizes a camera photo in place so it stays under the website's 5 MB limit. */
object PhotoShrinker {
    private const val MAX_SIDE = 1800
    private const val JPEG_QUALITY = 85

    fun shrink(file: File) {
        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeFile(file.path, bounds)
        val longest = maxOf(bounds.outWidth, bounds.outHeight)
        if (longest <= 0) return

        val options = BitmapFactory.Options().apply {
            inSampleSize = generateSequence(1) { it * 2 }.first { longest / (it * 2) < MAX_SIDE }
        }
        val decoded = BitmapFactory.decodeFile(file.path, options) ?: return
        val upright = rotateToExif(decoded, file)
        file.outputStream().use { upright.compress(Bitmap.CompressFormat.JPEG, JPEG_QUALITY, it) }
        upright.recycle()
    }

    /** Re-encoding drops the orientation tag, so turn the pixels themselves. */
    private fun rotateToExif(bitmap: Bitmap, file: File): Bitmap {
        val degrees = when (ExifInterface(file.path).getAttributeInt(ExifInterface.TAG_ORIENTATION, 1)) {
            ExifInterface.ORIENTATION_ROTATE_90 -> 90f
            ExifInterface.ORIENTATION_ROTATE_180 -> 180f
            ExifInterface.ORIENTATION_ROTATE_270 -> 270f
            else -> return bitmap
        }
        val matrix = Matrix().apply { postRotate(degrees) }
        val rotated = Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
        bitmap.recycle()
        return rotated
    }
}
