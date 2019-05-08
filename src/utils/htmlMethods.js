Element.prototype.remove = function () {
  if (this.parentElement) return this.parentElement.removeChild(this)
  
  this.disabled = true

  delete this
  
}

NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
  for (var i = this.length - 1; i >= 0; i--) {
    if (this[i] && this[i].parentElement) {
      this[i].parentElement.removeChild(this[i])
    }
  }
}
