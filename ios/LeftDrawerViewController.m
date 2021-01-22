//
//  LeftDrawerView.m
//  BringMe
//
//  Created by Miyuru Sagarage on 12/26/17.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "LeftDrawerViewController.h"

@implementation LeftDrawerViewController

- (void)viewDidLoad
{
  [super viewDidLoad];
  self.tableView.delegate = self;
  self.tableView.dataSource = self;
  self.tableView.tableFooterView = [[UIView alloc] initWithFrame:CGRectZero];
  
  [self.tableView registerNib:[UINib nibWithNibName:@"DrawerTableViewCell" bundle:nil]
       forCellReuseIdentifier:@"DrawerTableViewCell"];
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
  return 8;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
  DrawerTableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"DrawerTableViewCell"];
  
  if (!cell)
  {
    cell = [[DrawerTableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:@"DrawerTableViewCell"];
  }
  switch (indexPath.row) {
    case 0:
      cell.label.text = @"Home";
      cell.iconlabel.text = @"";
      break;
    case 1:
      cell.label.text = @"My Profile";
      cell.iconlabel.text = @"";
      break;
    case 2:
      cell.label.text = @"My Address";
      cell.iconlabel.text = @"";
      break;
    case 3:
      cell.label.text = @"My Orders";
      cell.iconlabel.text = @"";
      break;
    case 4:
      cell.label.text = @"Rate Us";
      cell.iconlabel.text = @"";
      break;
    case 5:
      cell.label.text = @"Contact Us";
      cell.iconlabel.text = @"";
      break;
    case 6:
      cell.label.text = @"Wish List";
      cell.iconlabel.text = @"";
      break;
    case 7:
      cell.label.text = @"Logout";
      cell.iconlabel.text = @"";
      break;
    default:
      break;
  }
  return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
  DrawerEventManager *eventManager = [DrawerEventManager allocWithZone: nil];
  NSString *itemName = @"";
  switch (indexPath.row) {
    case 0:
      itemName = @"Home";
      break;
    case 1:
      itemName = @"Profile";
      break;
    case 2:
      itemName = @"AddressList";
      break;
    case 3:
      itemName = @"OrderList";
      break;
    case 4:
      itemName = @"Rate";
      break;
    case 5:
      itemName = @"Faqs";
      break;
    case 6:
      itemName = @"WishList";
      break;
    case 7:
      itemName = @"Logout";
      break;
    default:
      itemName = @"Home";
      break;
  }
  dispatch_async(dispatch_get_main_queue(), ^{
    [[AppDelegate globalDelegate] toggleLeftDrawer:self animated:YES];
  });
  [eventManager drawerItemClicked:itemName];
  
}

@end
