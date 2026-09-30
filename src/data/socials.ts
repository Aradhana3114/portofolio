export const socials = {
  whatsapp: "085123365286",
  instagram: "arazyizhere",
  github: "Aradhana3114",
  linkedin: "aradhana-miftah-hermawan",
};

export const whatsappLink = (message = "Hi, I'm interested in working with you") =>
  `https://wa.me/62${socials.whatsapp.replace(/^0/, "")}?text=${encodeURIComponent(message)}`;
