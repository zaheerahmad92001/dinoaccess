//
//  SSIDReader.swift
//  dinoaccess
//
//  Created by Christopher Mühl on 04.09.19.
//  Copyright © 2019 Facebook. All rights reserved.
//

import Foundation
import SystemConfiguration.CaptiveNetwork

@objc(SSIDReader)
open class SSIDReader: NSObject {
  
  @objc(getSSID:rejecter:)
  func getSSID(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let interfaces = CNCopySupportedInterfaces() as? [String] else { return reject("", nil, nil) }
    let key = kCNNetworkInfoKeySSID as String
    for interface in interfaces {
      guard let interfaceInfo = CNCopyCurrentNetworkInfo(interface as CFString) as NSDictionary? else { continue }
      return resolve(interfaceInfo[key] as? String)
    }
    
    reject("", nil, nil)
  }
  
  @objc
  public static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
}
