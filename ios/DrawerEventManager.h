//
//  DrawerEventManager.h
//  BringMe
//
//  Created by Miyuru Sagarage on 12/26/17.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface DrawerEventManager : RCTEventEmitter <RCTBridgeModule>
- (void)drawerItemClicked:(NSString *)itemName;
@end
