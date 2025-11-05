const supabase = supabase.createClient("https://ugccrbzcscjajcdoklzc.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnY2NyYnpjc2NqYWpjZG9rbHpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzE2MjEsImV4cCI6MjA3NzkwNzYyMX0.jIYISCxyRyJ48eeRK4W68UhvPnvSIN6atIsTtkEP_qo");

async function login(){
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: pass.value
  });
  if(error) alert("Login Failed");
  else load();
}

async function addVideo(){
  await supabase.from("videos").insert([{
    title: title.value,
    thumbnail: thumb.value,
    src: src.value,
    channel: channel.value,
    views: "0",
    time: "Just now"
  }]);
  load();
}

async function load(){
  const { data } = await supabase.from("videos").select("*");
  list.innerHTML = `<tr><th>Title</th><th>Channel</th></tr>` +
    data.map(v=>`<tr><td>${v.title}</td><td>${v.channel}</td></tr>`).join("");
}
