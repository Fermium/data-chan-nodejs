var datachan = require('../data-chan.js');
var ref = require('ref');
var struct = require('ref-struct');
var datachan_lib = datachan.lib;
var datachan_result_enum = datachan.search_enum;

// you don't want an exception each time you open a device, right?
datachan_lib.datachan_init();
var args = process.argv.slice(2);
if(args.indexOf('-h')!=-1 ||args.indexOf('--help')!=-1){
  console.log('USAGE:');
  console.log('\t sudo node basic.js');
  console.log('\t Sudo is required for libusb');
  console.log('\t -s --verbose : Verbose output of measures');
  console.log('\t -times=[int] : Make [int] read requests, default 500');
  process.exit(0);
}

else{
  verbose=args.indexOf('-s')!=-1 ||args.indexOf('--verbose')!=-1;
  var times=500;
  for(arg in args){
    if(args[arg].indexOf('=')!=-1){
      times=parseInt(args[arg].split('=')[1]);
    }
  }
// what a good time to open a new device :)
var scan = datachan_lib.datachan_device_acquire();
  if (scan.result == datachan_result_enum.success) {
      console.log('Device opened');

  	// this is the device you acquired
      var dev = scan.device;
      datachan_lib.datachan_device_enable(scan.device);
      var i;
      var count=0;
      for(i=0;i<times;i++){
        if(datachan_lib.datachan_device_enqueued_measures(scan.device)){
          var measure;
          if(datachan_lib.datachan_device_is_enabled(scan.device)){
            var mes = datachan_lib.datachan_device_dequeue_measure(scan.device);
            measure =ref.deref(mes);
            count++;
          }
            var tmp= {
              'time' : measure.time*1000+measure.millis,
              'ch1' : null,
              'ch2' : null,
              'ch3' : null,
              'ch4' : null,
              'ch5' : null,
              'ch6' : null,
              'ch7' : null,
              'ch8' : null,
            }
            for(j=0;j<measure.measureNum;j++){
              tmp['ch'+measure.channels[j]]=measure.values[j];
            }
            if(verbose){
              console.log(tmp)
            }
          }
      }
      console.log("Acquired " + count + " measures");
  	// release the device
      datachan_lib.datachan_device_release(scan.device);
      console.log("Device Released");

  } else {
      console.log('Error opening the device: ');
      console.log(scan.result);
      datachan_lib.datachan_device_release(scan.device);
      datachan_lib.datachan_shutdown();
      process.exit(1);
  }

  // it is important to call this
  datachan_lib.datachan_shutdown();
  process.exit(0);
}
