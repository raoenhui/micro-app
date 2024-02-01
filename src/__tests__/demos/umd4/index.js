function mount () {
  const root = document.querySelector('#umd-root4')
  const doc = root.ownerDocument;
  const container = doc.createElement('div');
  container.className = 'container';
  root.appendChild(container);
}

function unmount () {
  const root = document.querySelector('#umd-root4')
  root && (root.innerHTML = '')
}

window['umd-app4'] = { mount, unmount }
