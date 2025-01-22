<script setup lang="ts">
import AppLayout from '~/layouts/AppLayout.vue'

import { Search } from 'lucide-vue-next'

defineOptions({ layout: AppLayout })

</script>

<template>
    <AppHead title="Support" description="Support and FAQs" />
    <div class="wrapper">
        <div class="welcome-section">
            <h1>WELCOME TO JUVENOTES SUPPORT</h1>
            <div class="search-bar">
                <input type="search" placeholder="Search for help" />
                <Search class="search-icon" />
            </div>
        </div>
        <div class="faq-section">
            <h1>FAQS</h1>
            <div class="faqs">
                <a href="#">Pricing Options and Payment Methods</a>
                <a href="#">Having trouble logging in?</a>
                <a href="#">How to create a new account?</a>
            </div>
        </div>
        <div class="reach-out-section">
            <h1>CONTACT SUPPORT</h1>
            <a href="mailto:support@juvenotes.com" class="contact-button">Email Us</a>
        </div>
    </div>
</template>

<style>
    div .wrapper{
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
     div .welcome-section{
        background-color: rgba(0, 0, 0, 0.5);
        background-image: url('public/images/dashboard.png');
        background-size: cover;
        background-position: center;
        width: 100%;
        height: 288px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        gap: 1rem;
        position: relative;
        opacity: 0.7;
     }
    div .welcome-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        /* z-index: 1; */
    }
     div .welcome-section h1{
        color: rgba(255, 255, 255);
        font-weight: 700;
        font-size: 1.875rem;
        line-height: 2.25rem;
        z-index: 1;
     }
     div .welcome-section .search-bar {
        position: relative;
        display: inline-block;
    }
    div .welcome-section .search-bar input[type="search"] {
        width: 300px;
        padding: 10px 40px 10px 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: rgba(255, 255, 255);
        color: #333;
    }
    div .welcome-section .search-bar .search-icon {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
    }
    div .faq-section{
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
     div .faq-section h1{
        color: rgb(31, 41, 55);
        font-weight: 700;
        font-size: 1.875rem;
        line-height: 2.25rem;
    }
    div .faqs{
        display: flex;
        flex-direction: column;
        gap: .5rem;
    }
    div .faqs a{
        text-decoration: none;
        color: rgb(85, 169, 196);
        background-color: rgb(248, 248, 248);
        padding: .8em 1em;
        transition: box-shadow 0.3s ease;
    }
    div .faqs a:hover{
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    div .reach-out-section h1 {
        color: rgb(31, 41, 55); /* Black color */
        font-weight: 700;
        font-size: 1.875rem;
        line-height: 2.25rem;
    }
    div .reach-out-section {
        text-align: center;
        margin-top: 2rem;
    }
    div .contact-button {
        display: inline-block;
        margin-top: 1rem;
        padding: 0.8em 1.5em;
        background-color: rgb(85, 169, 196); /* Blue button */
        color: white; /* White text color */
        text-decoration: none;
        border-radius: 4px;
        transition: background-color 0.3s ease;
    }
    div .contact-button:hover {
        background-color: rgb(65, 149, 176); /* Slightly darker blue on hover */
    }
</style>