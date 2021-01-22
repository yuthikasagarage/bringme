//
//  DrawerManager.m
//  BringMe
//
//  Created by Miyuru Sagarage on 12/26/17.
//  Copyright © 2017 Facebook. All rights reserved.
//
#import "DrawerManager.h"
#import "AppDelegate.h"

@implementation DrawerManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(toggleDrawer)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [[AppDelegate globalDelegate] toggleLeftDrawer:self animated:YES];
  });
  
}

@end
