self.addEventListener('push',event=>{
  let data={title:'ROHILLA DRIVE',body:'A new task needs your attention.',url:'/admin',tag:'rohilla-task'};
  try{if(event.data)data={...data,...event.data.json()}}catch{}
  event.waitUntil(self.registration.showNotification(data.title,{
    body:data.body,
    tag:data.tag,
    renotify:true,
    requireInteraction:false,
    data:{url:data.url||'/admin'},
    icon:'/rohilla-drive-logo-light.svg',
    badge:'/rohilla-drive-logo-light.svg'
  }));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=new URL(event.notification.data?.url||'/admin',self.location.origin).href;
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(windows=>{
    for(const client of windows){if(client.url.startsWith(self.location.origin)&&'focus'in client){client.navigate(target);return client.focus()}}
    return clients.openWindow?clients.openWindow(target):undefined;
  }));
});
