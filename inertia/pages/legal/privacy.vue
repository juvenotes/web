<script setup lang="ts">
import AppLayout from '~/layouts/AppLayout.vue'
defineOptions({ layout: AppLayout })
</script>

<template>
  <AppHead title="Our privacy policies" description="Juvenotes privacy policies" />
  <div class="max-w-4xl mx-auto py-12 px-4">
    <h1 class="text-3xl font-bold mb-8">Privacy Policy</h1>

    <div class="prose max-w-none space-y-8">
      <section>
        <h2 class="text-2xl font-semibold mb-4">Introduction</h2>
        <p>
          At Juvenotes, we take your privacy seriously. This policy describes how we collect, use,
          and protect your personal information when you use our educational platform.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">Information We Collect</h2>
        <ul class="list-disc pl-6 space-y-2">
          <li>
            <strong>Account Information:</strong> Name, email, password (encrypted), and profile
            picture
          </li>
          <li>
            <strong>Educational Data:</strong> Course selections, institution details, study
            progress
          </li>
          <li>
            <strong>Usage Data:</strong> Study time, learning streaks, and concept completion data
          </li>
          <li><strong>Authentication Data:</strong> When using Google Sign-In</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">How We Use Your Information</h2>
        <ul class="list-disc pl-6 space-y-2">
          <li>To provide personalized learning experiences</li>
          <li>To track and display your learning progress</li>
          <li>To improve our educational content and platform</li>
          <li>To communicate important updates about your account</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">Data Security</h2>
        <p>We implement security measures to protect your personal information, including:</p>
        <ul class="list-disc pl-6 space-y-2">
          <li>Encrypted password storage</li>
          <li>Secure SSL/TLS communication</li>
          <li>Regular security audits</li>
          <li>Limited employee access to personal data</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">Third-Party Services</h2>
        <p>We use trusted third-party services for:</p>
        <ul class="list-disc pl-6 space-y-2">
          <li>Google Authentication for secure sign-in</li>
          <li>Email communications</li>
          <li>Analytics to improve our service</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">Your Rights</h2>
        <p>You have the right to:</p>
        <ul class="list-disc pl-6 space-y-2">
          <li>Access your personal data</li>
          <li>Update your account information</li>
          <li>Request deletion of your account</li>
          <li>Export your learning data</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">Contact Us</h2>
        <p>
          If you have questions about this privacy policy or your personal data, please contact us
          at:
          <a href="mailto:privacy@juvenotes.com" class="text-primary hover:underline">
            privacy@juvenotes.com
          </a>
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">Updates to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify you of any changes by
          posting the new policy on this page and updating the effective date.
        </p>
        <p class="mt-4">Last updated: January 17 2025</p>
      </section>
    </div>
  </div>
</template>
