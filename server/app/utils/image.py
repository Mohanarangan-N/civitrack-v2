import io
from PIL import Image


def strip_exif(image_bytes: bytes) -> bytes:
    """Strip all EXIF metadata from image for anonymous privacy protection."""
    img = Image.open(io.BytesIO(image_bytes))
    # Create a new image without EXIF data
    clean = Image.new(img.mode, img.size)
    clean.putdata(list(img.getdata()))
    output = io.BytesIO()
    fmt = img.format or "JPEG"
    clean.save(output, format=fmt, quality=85)
    return output.getvalue()


def resize_image(image_bytes: bytes, max_size: tuple = (1920, 1080)) -> bytes:
    """Resize image if larger than max dimensions."""
    img = Image.open(io.BytesIO(image_bytes))
    img.thumbnail(max_size, Image.LANCZOS)
    output = io.BytesIO()
    fmt = img.format or "JPEG"
    img.save(output, format=fmt, quality=85)
    return output.getvalue()
