<script setup lang="ts">
import AppLayout from '~/layouts/AppLayout.vue'
defineOptions({ layout: AppLayout })
</script>

<template>
  <div class="max-w-4xl mx-auto py-12 px-4">
    <h1 class="text-3xl font-bold mb-8">Terms and Conditions</h1>
    
    <div class="prose max-w-none space-y-8">
      <section>
        <h2 class="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
        <p>
          By accessing and using Juvenotes, you agree to be bound by these Terms and Conditions. 
          If you disagree with any part of these terms, you may not access our services.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">2. User Accounts</h2>
        <ul class="list-disc pl-6 space-y-2">
          <li>You must be enrolled in a recognized medical institution to register</li>
          <li>You are responsible for maintaining account security</li>
          <li>Account sharing is prohibited</li>
          <li>Provide accurate and complete information during registration</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">3. Educational Content</h2>
        <ul class="list-disc pl-6 space-y-2">
          <li>Content is for educational purposes only</li>
          <li>Materials are protected by copyright</li>
          <li>Unauthorized distribution is prohibited</li>
          <li>Content may be updated or modified periodically</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">4. Code of Conduct</h2>
        <p>Users agree not to:</p>
        <ul class="list-disc pl-6 space-y-2">
          <li>Share account credentials</li>
          <li>Distribute or copy content</li>
          <li>Engage in disruptive behavior</li>
          <li>Upload harmful content or malware</li>
          <li>Attempt to breach platform security</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">5. Medical Disclaimer</h2>
        <p>
          The content on Juvenotes is for educational purposes only and should not be used as a substitute 
          for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified 
          healthcare providers with questions regarding medical conditions.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">6. Service Modifications</h2>
        <p>
          We reserve the right to modify, suspend, or discontinue any part of our service at any time 
          without notice. We will not be liable if any part of the service becomes unavailable.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">7. Termination</h2>
        <p>
          We may terminate or suspend your account immediately, without prior notice, for conduct that 
          we determine violates these Terms or is harmful to other users, us, or third parties, or for 
          any other reason.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">8. Contact Information</h2>
        <p>
          For any questions about these Terms, please contact us at:
          <a href="mailto:legal@juvenotes.com" class="text-primary hover:underline">
            legal@juvenotes.com
          </a>
        </p>
      </section>

      <section>
        <p class="text-sm text-muted-foreground mt-8">
          Last updated: January 17 2025
        </p>
      </section>
    </div>
  </div>
</template>