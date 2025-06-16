<template>
  <div class="font-awesome-demo p-6 space-y-4">
    <h2 class="text-2xl font-bold mb-4">Font Awesome Typography Examples</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Font Families -->
      <div class="p-4 border rounded-lg">
        <h3 class="text-xl font-bold mb-2">Font Families</h3>
        <div class="space-y-2">
          <p class="font-sans">Default font with Font Awesome available</p>
          <p class="font-fa text-fa-solid">Font Awesome Solid (&#xf005; &#xf004; &#xf007;)</p>
          <p class="font-fa-brands">Font Awesome Brands (&#xf099; &#xf16d; &#xf08c;)</p>
        </div>
      </div>
      
      <!-- Text Examples -->
      <div class="p-4 border rounded-lg">
        <h3 class="text-xl font-bold mb-2">Text Examples</h3>
        <div class="space-y-2">
          <p>Regular text with <span class="text-fa-solid">&#xf005;</span> inline icon</p>
          <p class="font-bold">Bold text with <span class="text-fa-solid">&#xf004;</span> icon</p>
          <p class="text-blue-600">Colored text with <span class="text-fa-solid text-red-500">&#xf007;</span> icon</p>
        </div>
      </div>
      
      <!-- Usage in Lists -->
      <div class="p-4 border rounded-lg">
        <h3 class="text-xl font-bold mb-2">List Examples</h3>
        <ul class="space-y-2">
          <li><span class="text-fa-solid pr-2">&#xf00c;</span> Item with check</li>
          <li><span class="text-fa-solid pr-2">&#xf0e7;</span> Important item</li>
          <li><span class="text-fa-solid pr-2">&#xf059;</span> Question item</li>
        </ul>
      </div>
      
      <!-- Usage in Buttons -->
      <div class="p-4 border rounded-lg">
        <h3 class="text-xl font-bold mb-2">Button Examples</h3>
        <div class="flex flex-wrap gap-2">
          <button class="bg-blue-600 text-white px-4 py-2 rounded">
            <span class="text-fa-solid mr-2">&#xf019;</span>Download
          </button>
          <button class="bg-green-600 text-white px-4 py-2 rounded">
            <span class="text-fa-solid mr-2">&#xf00c;</span>Approve
          </button>
          <button class="bg-red-600 text-white px-4 py-2 rounded">
            <span class="text-fa-solid mr-2">&#xf00d;</span>Cancel
          </button>
        </div>
      </div>
    </div>
    
    <div class="mt-6">
      <p class="text-sm text-gray-600">
        Note: This component demonstrates how Font Awesome can be used for typography across the site.
        The hexadecimal codes (&#xf005;) represent specific Font Awesome icons when rendered with the
        Font Awesome font family.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props or additional logic needed for this example component
</script>
