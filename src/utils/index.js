export const htmlToDom = (html) => {
  const templateDom = document.createElement('template');
  templateDom.innerHTML = html;
  document.body.appendChild(templateDom.content);
};

export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
