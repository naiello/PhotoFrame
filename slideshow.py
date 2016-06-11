#! /usr/bin/env python
# Slideshow Viewer
# Author: Nick Aiello
# Last Modified: 6/5/2016

import pygame
import pygame.time
import random
import os
import re
from PIL import Image, ExifTags
from datetime import datetime

SCREEN_W = 320
SCREEN_H = 240
PROP_DCUTE = 0.5
SLIDE_TIME = 60
PHOTO_DIR = os.path.expanduser('~') + '/photoframe/photos/'
DCUTE_DIR = PHOTO_DIR + 'dailycute/'
DRIVE_DIR = PHOTO_DIR + 'googledrive/'
FILE_FORMATS = ['.jpg', '.png', '.mp4', '.mpg']
FILE_FORMATS_RE = '(' + '|'.join(FILE_FORMATS).replace('.', '\\.') + ')$'

# Find key corresponding to image orientation EXIF tag
# TODO: Find a cleaner way to extract EXIF information
for ORIENTATION_KEY in ExifTags.TAGS.keys():
    if ExifTags.TAGS[ORIENTATION_KEY] == 'Orientation':
        break

def rotate_image_exif(image, orientation):
    if orientation == 1:    # no transform`
        return image
    elif orientation == 2:  # flip X
        return pygame.transform.flip(image, True, False)
    elif orientation == 3:  # rotate 180
        return pygame.transform.rotate(image, 180)
    elif orientation == 4:  # flip Y
        return pygame.transform.flip(image, False, True)
    elif orientation == 5:  # rotate 90 and flip X
        image2 = pygame.transform.flip(image, True, False)
        return pygame.transform.rotate(image, 90)
    elif orientation == 6: # rotate -90
        return pygame.transform.rotate(image, -90)
    elif orientation == 7: # flip X and rotate -90
        image2 = pygame.transform.flip(image, True, False)
        return pygame.transform.rotate(image, -90)
    elif orientation == 8: # rotate 90
        return pygame.transform.rotate(image, 90)


def next_slide():
    r = random.random()
    image_source = DRIVE_DIR
    delete_after = False
    if r < PROP_DCUTE:
        image_source = DCUTE_DIR
        delete_after = True

    photos = [f for f in os.listdir(image_source) if re.search(FILE_FORMATS_RE, f, re.IGNORECASE)]
    if len(photos) == 0:
        return

    next_photo = image_source + random.choice(photos)
    try:
        image = pygame.image.load(next_photo)
    except:
        return

    # read EXIF tags to determine correct image orientation
    tags = {}
    try:
        imagefile = Image.open(next_photo)
        tags = dict(imagefile._getexif().items())
    except (AttributeError, KeyError, IndexError):
        pass # no orientation info found

    orientation = 1
    if ORIENTATION_KEY in tags.keys():
        orientation = tags[ORIENTATION_KEY]

    image = rotate_image_exif(image, orientation)

    # rescale the image to fit on screen
    imsize = image.get_size()
    s = (float(SCREEN_W) / imsize[0], float(SCREEN_H) / imsize[1])
    scale = s[0]
    if s[1] < s[0]:
        scale = s[1]

    if scale < 1:
        image = pygame.transform.smoothscale(image, (int(imsize[0] * scale), int(imsize[1] * scale)))


    if delete_after:
        os.remove(next_photo)

    return image

if __name__ == '__main__':
    random.seed(datetime.now())
    pygame.init()
    screen = pygame.display.set_mode((SCREEN_W, SCREEN_H), pygame.FULLSCREEN)
    pygame.mouse.set_visible(False)
    running = True
    while running:
        for i in xrange(0, SLIDE_TIME):
            for event in pygame.event.get():
                if event.type == pygame.QUIT or pygame.key.get_pressed()[pygame.K_ESCAPE]:
                    running = False
                    break

            if not running:
                break
            pygame.time.wait(1000)

        image = next_slide()
        screen.fill((0, 0, 0))
        if image is not None:
            imsize = image.get_rect().size
            screen.blit(image, ((SCREEN_W - imsize[0]) / 2, (SCREEN_H - imsize[1]) / 2))
            pygame.display.flip()

    pygame.quit()
