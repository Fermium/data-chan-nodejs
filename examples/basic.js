var datachan = require('../data-chan.js');
var ref = require('ref');
var fs = require('fs');
var struct = require('ref-struct');
var datachan_lib = datachan.lib;
var datachan_result_enum = datachan.search_enum;

datachan_lib.datachan_init();
var args = process.argv.slice(2);
var xprt = [];
/*
a = 0.008019432
b = 0.9397528
*/
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
  for(var arg in args){
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
      var a = 0.008019432;
      var b =0.9397528;
      datachan_lib.datachan_device_enable(scan.device);
      var i;
      var count=0;
      var dc = 0xFF;
      var buf = new Buffer(8);
      //var buf = new Buffer(4);
      var k = 1900;
      var valori=[];
      for(i=0;i<=2048;i++){
        valori[i]=2048+i;
      }
     buf.writeFloatLE(a-0.5/b,0);
     buf.writeFloatLE(a+0.5/b,4);
      datachan_lib.datachan_send_async_command(scan.device,1,buf,buf.length);

      for(i=0;i<times;i++){
        /*if(i%50000==0){
          //buf.writeUInt16LE(valori[k],0);
          buf.writeUInt16LE(k,0);
          datachan_lib.datachan_send_async_command(scan.device,4,buf,buf.length);
          k=(k+1)%2296
        }*/

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
          };
          for(j=0;j<measure.measureNum;j++){
            tmp['ch'+measure.channels[j]]=measure.values[j];
          }
          tmp.raw_current=k;
          datachan_lib.datachan_clean_measure(mes);
          xprt.push(tmp);
          if(verbose){
            console.log(tmp);
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
