/**
 * Shown on pages whose copy is still placeholder. DEPLOY.md lists real case studies, blog posts,
 * testimonials and team bios as launch assets still to be produced. Remove this notice (and the
 * placeholder content) once real material is in place.
 */
export function SampleContentNotice() {
  return (
    <div role="note" className="fixed top-16 inset-x-0 z-40 bg-yellow-500/10 border-b border-yellow-500/30 text-yellow-200 text-xs text-center py-1.5 px-4 backdrop-blur">
      Prototype: the content on this page is sample placeholder text, not real clients, results or staff.
    </div>
  )
}
