//
//  SSIDReader.m
//  dinoaccess
//
//  Created by Christopher Mühl on 04.09.19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SSIDReader, NSObject)

RCT_EXTERN_METHOD(getSSID:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end
