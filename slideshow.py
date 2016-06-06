#! /usr/bin/env python
# Slideshow Viewer
# Author: Nick Aiello
# Last Modified: 6/5/2016

import pygame
import pygame.time
import random
import os
from threading import Timer

SCREEN_W = 640
SCREEN_H = 480
PROP_DCUTE = 0.5
SLIDE_TIME = 60
PHOTO_DIR = os.path.expanduser('~') + '/photoframe/photos/'
DCUTE_DIR = PHOTO_DIR + 'dailycute/'
DRIVE_DIR = PHOTO_DIR + 'googledrive/'

pygame.init()
screen = pygame.display.set_mode((SCREEN_W, SCREEN_H), pygame.FULLSCREEN)

running = True

def next_slide():
    r = random.random()
    image_source = DRIVE_DIR
    delete_after = False
    if r < PROP_DCUTE:
        image_source = DCUTE_DIR
        delete_after = True

    photos = [f for f in os.listdir(image_source) if '.jpg' in f]
    if len(photos) == 0:
        return

    next_photo = image_source + random.choice(photos)
    try:
        image = pygame.image.load(next_photo)
    except Error:
        return

    if delete_after:
        os.remove(next_photo)

    imsize = image.get_rect().size
    if imsize[1] >= imsize[0] and imsize[1] > SCREEN_H:
        image = pygame.transform.scale(image, (int((float(SCREEN_H) / imsize[1]) * SCREEN_W), SCREEN_H))
    elif imsize[0] > SCREEN_W:
        image = pygame.transform.scale(image, (SCREEN_W, int((float(SCREEN_W) / imsize[0]) * SCREEN_H)))

    return image

if __name__ == '__main__':
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT or (event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE):
                running = False

        pygame.time.wait(SLIDE_TIME * 1000)

        image = next_slide()
        screen.fill((0, 0, 0))
        if image is not None:
            imsize = image.get_rect().size
            screen.blit(image, ((SCREEN_W - imsize[0]) / 2, (SCREEN_H - imsize[1]) / 2))
            pygame.display.flip()

    pygame.quit()
