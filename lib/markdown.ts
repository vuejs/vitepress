export function markdownToVue(content: string): string {
  return `<template>${content}</template>`
}
