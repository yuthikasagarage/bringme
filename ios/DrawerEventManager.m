//
//  DrawerEventManager.m
//  BringMe
//
//  Created by Miyuru Sagarage on 12/26/17.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "DrawerEventManager.h"

@implementation DrawerEventManager

RCT_EXPORT_MODULE();

+ (id)allocWithZone:(NSZone *)zone {
  static DrawerEventManager *sharedInstance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [super allocWithZone:zone];
  });
  return sharedInstance;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"DrawerItemClicked"];
}

- (void)drawerItemClicked:(NSString *)itemName
{
  [self sendEventWithName:@"DrawerItemClicked" body:@{@"item": itemName}];
}

@end
