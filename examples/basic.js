var datachan = require('../data-chan.js');
var ref = require('ref');
var struct = require('ref-struct');
var datachan_lib = datachan.lib;
var datachan_result_enum = datachan.search_enum;

// you don't want an exception each time you open a device, right?
datachan_lib.datachan_init();
var args = process.argv.slice(2)[0];
var verbose;
if(args=='-h' || args=='--help'){
  console.log('USAGE:');
  console.log('\t sudo node basic.js');
  console.log('\t Sudo is required for libusb');
  console.log('\t -s -v : Verbose output of measures');
  process.exit(0);
}

else{
  verbose=args=='-s' || args=='-v';
// what a good time to open a new device :)
var scan = datachan_lib.datachan_device_acquire();
  if (scan.result == datachan_result_enum.success) {
      console.log('Device opened!');

  	// this is the device you acquired
      var dev = scan.device;
      datachan_lib.datachan_device_enable(scan.device);

      for(i=0;i<100;i++){
        if(datachan_lib.datachan_device_enqueued_measures(scan.device)){
          var measure;
          if(datachan_lib.datachan_device_is_enabled(scan.device)){
            var mes = datachan_lib.datachan_device_dequeue_measure(scan.device);
            measure =ref.deref(mes);
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
            for(i=0;i<measure.measureNum;i++){
              tmp['ch'+measure.channels[i]]=measure.values[i];
            }
            if(verbose){
              console.log(tmp)
            }
          }
      }
  	// release the device
      datachan_lib.datachan_device_release(scan.device);

  } else {
      console.log('Error opening the device: ');
      console.log(scan.result);
  }

  // it is important to call this
  datachan_lib.datachan_shutdown();
  process.exit(scan.result);
}
